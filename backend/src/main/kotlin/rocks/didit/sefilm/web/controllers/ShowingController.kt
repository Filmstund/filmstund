package rocks.didit.sefilm.web.controllers

import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.access.AccessDeniedException
import org.springframework.web.bind.annotation.*
import org.springframework.web.util.UriComponentsBuilder
import rocks.didit.sefilm.*
import rocks.didit.sefilm.clients.GoogleCalenderClient
import rocks.didit.sefilm.database.entities.*
import rocks.didit.sefilm.database.repositories.*
import rocks.didit.sefilm.domain.*
import rocks.didit.sefilm.domain.dto.*
import rocks.didit.sefilm.domain.dto.ResponseStatusDTO.SuccessfulStatusDTO
import java.time.Duration
import java.time.ZoneId
import java.time.ZonedDateTime
import java.util.*

@RestController
class ShowingController(private val repo: ShowingRepository,
                        private val locationRepo: LocationRepository,
                        private val movieRepo: MovieRepository,
                        private val userRepo: UserRepository,
                        private val paymentInfoRepo: ParticipantPaymentInfoRepository,
                        private val googleCalenderClient: GoogleCalenderClient) {
  companion object {
    private const val PATH = Application.API_BASE_PATH + "/showings"
    private const val PATH_WITH_ID = PATH + "/{id}"
  }

  private val log = LoggerFactory.getLogger(ShowingController::class.java)

  @GetMapping(PATH, produces = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE))
  fun findAll(): List<Showing> {
    val showings = repo.findByPrivate(false)
    val fromThisDate = ZonedDateTime.now().minusDays(7).toLocalDate()
    return showings
      .filter { it.date?.isAfter(fromThisDate) ?: false }
      .map(Showing::withoutSensitiveFields)
  }

  @GetMapping(PATH_WITH_ID, produces = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE))
  fun findOne(@PathVariable id: UUID): Showing = repo.findById(id).map(Showing::withoutSensitiveFields).orElseThrow { NotFoundException("showing '$id") }

  @PutMapping(PATH_WITH_ID, consumes = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE), produces = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE))
  fun updateShowing(@PathVariable id: UUID, @RequestBody body: UpdateShowingDTO): Showing {
    val showing = findOne(id)
    assertLoggedInUserIsAdmin(showing)
    assertUserHasPhoneNumber(showing.admin)

    val newPayToUser = when {
      body.payToUser != null -> UserID(body.payToUser)
      else -> showing.payToUser
    }
    val newLocation = when {
      body.newLocation != null -> {
        locationRepo.findById(body.newLocation)
          .orElseGet { locationRepo.save(Location(body.newLocation)) }
      }
      else -> showing.location
    }

    val updateShowing = showing.copy(
      price = SEK(body.price),
      private = body.private,
      ticketsBought = body.ticketsBought,
      expectedBuyDate = body.expectedBuyDate,
      payToUser = newPayToUser,
      time = body.newTime ?: showing.time,
      location = newLocation)

    val updatedShowing = repo.save(updateShowing)
    if (body.ticketsBought) {
      createInitialPaymentInfo(updateShowing)
    }
    return updatedShowing
  }

  @DeleteMapping(PATH_WITH_ID, produces = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE))
  fun deleteShowing(@PathVariable id: UUID): SuccessfulStatusDTO {
    val showing = findOne(id)
    assertLoggedInUserIsAdmin(showing)

    paymentInfoRepo.deleteByShowingIdAndUserId(showing.id, currentLoggedInUser())
    repo.delete(showing)
    return SuccessfulStatusDTO("Showing with id ${showing.id} were removed successfully")
  }

  @PostMapping(PATH_WITH_ID + "/invite/googlecalendar", consumes = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE), produces = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE))
  fun createGoogleCalendarEvent(@PathVariable id: UUID, @RequestBody body: List<String>): ResponseStatusDTO {
    val showing = findOne(id)
    assertLoggedInUserIsAdmin(showing)
    if (!showing.calendarEventId.isNullOrBlank()) throw BadRequestException("Calendar event already created")

    val movie = movieRepo.findById(showing.movieId).orElseThrow { NotFoundException("movie '$showing.movieId'") }
    val runtime = movie.getDurationOrDefault()
    val participantEmails = userRepo.findAllById(showing.participants.map { it.userID }).map { it.email }
    val zoneId = ZoneId.of("Europe/Stockholm")
    val event = CalendarEventDTO.of(
      summary = movie.title,
      location = showing.location,
      emails = participantEmails,
      start = ZonedDateTime.of(showing.date, showing.time, zoneId).plusSeconds(1),
      end = ZonedDateTime.of(showing.date, showing.time, zoneId).plus(runtime).plusSeconds(1)
    )

    log.info("Creating calendar event for showing '${showing.id}' and ${participantEmails.size} participants")
    val createdEventId = googleCalenderClient.createEvent(event, oauthAccessToken())
    val updatedShowing = showing.copy(calendarEventId = createdEventId)
    repo.save(updatedShowing)

    return SuccessfulStatusDTO("Event with ID=$createdEventId created")
  }

  @GetMapping(PATH_WITH_ID + "/buy")
  fun getBuyingTicketDetails(@PathVariable id: UUID): BuyDTO {
    val showing = findOne(id)
    assertLoggedInUserIsAdmin(showing)

    // Note that this list is empty before the showing has been marked as bought
    val paymentInfos = paymentInfoRepo.findByShowingId(showing.id)
    val bioklubbMap = userRepo.findAllById(showing.participants.map { it.userID })
      .map { BioklubbUserMap(it.id, it.bioklubbnummer) }

    updateFöretagsbiljettAsUsed(showing.participants)

    return BuyDTO(getSfBuyLink(showing), bioklubbMap, paymentInfos, showing.participants)
  }

  private fun updateFöretagsbiljettAsUsed(participants: Set<Participant>) {
    val relevantUsers = participants.filter { p ->
      when(p) {
        is PaymentParticipant -> p.payment.type == PaymentType.Företagsbiljett
        else -> false
      }
    }

    val updatedUsers = mutableListOf<User>()
    for (u in relevantUsers) {
      if(u is PaymentParticipant) {
        val user = userRepo.findById(u.userID).get()
        val newUser = updateStatus(u, user)
        updatedUsers.add(newUser)
      }
    }

    userRepo.saveAll(updatedUsers)
  }

  private fun updateStatus(p: PaymentParticipant, u: User): User {
    val newForetagsbiljetter = u.foretagsbiljetter.map { ftg -> if (ftg.value == p.payment.extra) ftg.copy(status = ForetagsbiljettStatus.Used) else ftg }
    return u.copy(foretagsbiljetter = newForetagsbiljetter)
  }

  @GetMapping(PATH_WITH_ID + "/pay")
  fun getAttendeePaymentInfo(@PathVariable id: UUID): PaymentDTO {
    val showing = findOne(id)
    val payeePhone = findUser(showing.payToUser)
      .phone
      .orElseThrow { MissingPhoneNumberException() }

    val currentUser = currentLoggedInUser()
    val participantInfo = paymentInfoRepo
      .findByShowingIdAndUserId(id, currentUser)
      .orElseThrow { PaymentInfoMissing(id) }

    val swishTo = when {
      !participantInfo.hasPaid && participantInfo.amountOwed.ören > 0 -> constructSwishUri(showing, payeePhone, participantInfo)
      else -> null
    }

    return PaymentDTO(participantInfo.hasPaid, participantInfo.amountOwed, showing.payToUser, swishTo, currentUser)
  }

  @PostMapping(PATH, consumes = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE), produces = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE))
  @ResponseStatus(HttpStatus.CREATED)
  fun createShowing(@RequestBody body: ShowingDTO, b: UriComponentsBuilder): ResponseEntity<Showing> {
    if (body.date == null || body.location == null || body.movieId == null || body.time == null) throw MissingParametersException()
    if (!movieRepo.existsById(body.movieId)) {
      throw NotFoundException("movie '${body.movieId}'. Can't create showing for movie that does not exist")
    }

    val adminUser = userRepo
      .findById(currentLoggedInUser())
      .map(User::toLimitedUserInfo)
      .orElseThrow { NotFoundException("Current logged in user not found in db") }

    val savedShowing = repo.save(body.toShowing(adminUser))
    val newLocation = b.path(PATH_WITH_ID).buildAndExpand(savedShowing.id).toUri()
    return ResponseEntity.created(newLocation).body(savedShowing)
  }

  @PostMapping(PATH_WITH_ID + "/attend", produces = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE))
  fun attend(@PathVariable id: UUID, @RequestBody body: AttendInfoDTO): Set<Participant> {
    val showing = findOne(id)
    assertTicketsNotBought(showing)

    val participantsPlusLoggedInUser = showing.participants.toMutableSet()
    val userId = currentLoggedInUser()

    val participant = PaymentParticipant(userId, body.paymentOption)

    if (participant.payment.type == PaymentType.Företagsbiljett) {
      updateFöretagsbiljettAsPending(userId, participant)
    }

    participantsPlusLoggedInUser.removeIf { p -> p.userID == userId }
    participantsPlusLoggedInUser.add(participant)

    val savedShowing = repo.save(showing.copy(participants = participantsPlusLoggedInUser))

    return savedShowing.participants.map(Participant::toLimitedParticipant).toSet()
  }

  private fun updateFöretagsbiljettAsPending(userId: UserID, participant: PaymentParticipant) {
    val user = userRepo.findById(userId).get();
    val predicate: (Foretagsbiljett) -> Boolean = { ticket -> ticket.value == participant.payment.extra }
    if (user.foretagsbiljetter.any(predicate)) {
      val oldTicket = user.foretagsbiljetter.findLast(predicate)
      var newTickets = user.foretagsbiljetter.toMutableList()
      newTickets.remove(oldTicket)
      val newTicket = Foretagsbiljett(
        value = oldTicket!!.value,
        status = ForetagsbiljettStatus.Pending,
        expires = oldTicket.expires)
      newTickets.add(newTicket)
      val newUser = user.copy(foretagsbiljetter = newTickets)
      userRepo.save(newUser)
    } else {
      throw NotFoundException("No such Företagsbiljett found on user")
    }
  }

  @PostMapping(PATH_WITH_ID + "/unattend", produces = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE))
  fun unattend(@PathVariable id: UUID): List<Participant> {
    val showing = findOne(id)
    assertTicketsNotBought(showing)

    val participantsWithoutLoggedInUser = showing.participants.toMutableSet()
    participantsWithoutLoggedInUser.removeIf { p -> p.userID == currentLoggedInUser() }

    val savedShowing = repo.save(showing.copy(participants = participantsWithoutLoggedInUser))
    return savedShowing.participants.map(Participant::toLimitedParticipant)
  }

  /* Fetch location from db or create it if it does not exist before converting the showing */
  private fun ShowingDTO.toShowing(admin: LimitedUserInfo): Showing {
    val location = locationRepo
      .findById(this.location)
      .orElseGet { locationRepo.save(Location(name = this.location)) }
    return Showing(date = this.date,
      time = this.time,
      movieId = this.movieId,
      location = location,
      admin = admin.id,
      payToUser = admin.id,
      expectedBuyDate = this.expectedBuyDate,
      participants = setOf(PaymentParticipant(admin.id, PaymentOption(PaymentType.Swish))))
  }

  private fun createInitialPaymentInfo(showing: Showing) {
    val participants = showing.participants.map { participant ->
      paymentInfoRepo.findByShowingIdAndUserId(showing.id, participant.userID)
        .map {
          // Use existing info
          ParticipantPaymentInfo(
            id = it.id,
            userId = participant.userID,
            showingId = showing.id,
            hasPaid = it.hasPaid,
            amountOwed = it.amountOwed)
        }
        .orElseGet {
          // Create new info
          ParticipantPaymentInfo(userId = participant.userID,
            showingId = showing.id,
            hasPaid = participant.userID == showing.payToUser,
            amountOwed = showing.price ?: SEK(0))
        }
    }
    paymentInfoRepo.saveAll(participants)
  }

  private fun assertTicketsNotBought(showing: Showing) {
    if (showing.ticketsBought) {
      throw TicketsAlreadyBoughtException(showing.id)
    }
  }

  private fun assertLoggedInUserIsAdmin(showing: Showing) {
    if (currentLoggedInUser() != showing.admin) {
      throw AccessDeniedException("Only the showing admin is allowed to do that")
    }
  }

  private fun assertUserHasPhoneNumber(userID: UserID) {
    val user = findUser(userID)
    if (user.phone == null || user.phone.number.isNullOrBlank()) {
      throw MissingPhoneNumberException()
    }
  }

  private fun constructSwishUri(showing: Showing, payeePhone: PhoneNumber, participantInfo: ParticipantPaymentInfo): String {
    val movieTitle = movieRepo
      .findById(showing.movieId)
      .orElseThrow { NotFoundException("movie with id " + showing.movieId) }
      .title

    return SwishDataDTO(
      payee = StringValue(payeePhone.number),
      amount = IntValue(participantInfo.amountOwed.toKronor()),
      message = generateSwishMessage(movieTitle, showing))
      .generateUri()
      .toASCIIString()
  }

  private fun generateSwishMessage(movieTitle: String, showing: Showing): StringValue {
    val timeAndDate = " @ ${showing.date} ${showing.time}"
    val maxSize = Math.min(movieTitle.length, 50 - timeAndDate.length)
    val truncatedMovieTitle = movieTitle.substring(0, maxSize)

    return StringValue("$truncatedMovieTitle$timeAndDate")
  }

  private fun Movie.getDurationOrDefault(): Duration {
    if (this.runtime.isZero) {
      return Duration.ofHours(2).plusMinutes(30)
    }
    return this.runtime
  }

  private fun findUser(userID: UserID) =
    userRepo
      .findById(userID)
      .orElseThrow { NotFoundException("user " + userID) }

  private fun getSfBuyLink(showing: Showing): String? {
    val movie = movieRepo
      .findById(showing.movieId)
      .orElseThrow { NotFoundException("movie '${showing.movieId}") }

    return when {
      movie.sfId != null && movie.sfSlug != null -> "https://www.sf.se/film/${movie.sfId}/${movie.sfSlug}"
      else -> null
    }
  }

  private fun PhoneNumber?.orElseThrow(exceptionSupplier: () -> Exception): PhoneNumber {
    if (this == null) {
      throw exceptionSupplier()
    }
    return this
  }
}
