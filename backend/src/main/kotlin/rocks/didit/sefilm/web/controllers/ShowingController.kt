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
                        private val ticketManager: TicketManager,
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

  private fun findShowing(id: UUID) = repo.findById(id).orElseThrow { NotFoundException("showing '$id'") }

  @PutMapping(PATH_WITH_ID, consumes = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE), produces = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE))
  fun updateShowing(@PathVariable id: UUID, @RequestBody body: UpdateShowingDTO): Showing {
    val showing = findShowing(id)
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

    // TODO update calendar event
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
      markAllFöretagsbiljetterAsUsed(showing.participants)
      createInitialPaymentInfo(updateShowing)
    }

    if (body.sfTicketLink != null && body.sfTicketLink.isNotBlank()) {
      ticketManager.processTickets(body.sfTicketLink, updatedShowing)
    }

    return updatedShowing
  }

  @DeleteMapping(PATH_WITH_ID, produces = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE))
  fun deleteShowing(@PathVariable id: UUID): SuccessfulStatusDTO {
    val showing = findShowing(id)
    assertLoggedInUserIsAdmin(showing)

    if (showing.calendarEventId != null) {
      googleCalenderClient.deleteEvent(showing.calendarEventId)
    }
    if (!showing.ticketsBought) {
      markAllFöretagsbiljetterAsAvailable(showing.participants)
    }
    paymentInfoRepo.deleteByShowingIdAndUserId(showing.id, currentLoggedInUser())
    repo.delete(showing)
    ticketManager.deleteTickets(showing)

    return SuccessfulStatusDTO("Showing with id ${showing.id} were removed successfully")
  }

  @PostMapping(PATH_WITH_ID + "/invite/googlecalendar", consumes = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE), produces = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE))
  fun createGoogleCalendarEvent(@PathVariable id: UUID): ResponseStatusDTO {
    val showing = findShowing(id)
    assertLoggedInUserIsAdmin(showing)
    if (!showing.calendarEventId.isNullOrBlank()) throw BadRequestException("Calendar event already created")

    val movie = movieRepo.findById(showing.movieId).orElseThrow { NotFoundException("movie '$showing.movieId'") }
    val runtime = movie.getDurationOrDefault()
    val participantEmails = userRepo.findAllById(showing.participants.map { it.extractUserId() }).map { it.email }
    val zoneId = ZoneId.of("Europe/Stockholm")
    val event = CalendarEventDTO.of(
      summary = movie.title,
      location = showing.location,
      emails = participantEmails,
      start = ZonedDateTime.of(showing.date, showing.time, zoneId).plusSeconds(1),
      end = ZonedDateTime.of(showing.date, showing.time, zoneId).plus(runtime).plusSeconds(1)
    )

    log.info("Creating calendar event for showing '${showing.id}' and ${participantEmails.size} participants")
    val createdEventId = googleCalenderClient.createEvent(event)
    val updatedShowing = showing.copy(calendarEventId = createdEventId)
    repo.save(updatedShowing)

    return SuccessfulStatusDTO("Event with ID=$createdEventId created")
  }

  @GetMapping(PATH_WITH_ID + "/buy")
  fun getBuyingTicketDetails(@PathVariable id: UUID): BuyDTO {
    val showing = findShowing(id)
    assertLoggedInUserIsAdmin(showing)

    // Note that this list is empty before the showing has been marked as bought
    val paymentInfos = paymentInfoRepo.findByShowingId(showing.id)
    val ticketMap = showing.participants.map {
      val user = findUser(it.extractUserId())
      val ftgTicket = when (it) {
        is FtgBiljettParticipant -> it.ticketNumber
        else -> null
      }

      UserToTicketMap(user.id, user.sfMembershipId, ftgTicket)
    }

    return BuyDTO(getSfBuyLink(showing), ticketMap, paymentInfos)
  }

  private fun markAllFöretagsbiljetterAs(participants: Set<Participant>, status: Företagsbiljett.Status) {
    val relevantParticipants = participants
      .filter { it is FtgBiljettParticipant }
      .map { it as FtgBiljettParticipant }

    val updatedUsers = relevantParticipants
      .map {
        updateFtgbiljettStatusOnUser(findUser(it.userId), it.ticketNumber, status)
      }
    userRepo.saveAll(updatedUsers)
  }

  private fun markAllFöretagsbiljetterAsUsed(participants: Set<Participant>) = markAllFöretagsbiljetterAs(participants, Företagsbiljett.Status.Used)
  private fun markAllFöretagsbiljetterAsAvailable(participants: Set<Participant>) = markAllFöretagsbiljetterAs(participants, Företagsbiljett.Status.Available)

  private fun markFöretagsbiljettAsAvailable(userID: UserID, ticketNumber: TicketNumber) {
    userRepo.save(updateFtgbiljettStatusOnUser(findUser(userID), ticketNumber, Företagsbiljett.Status.Available))
  }

  private fun updateFtgbiljettStatusOnUser(user: User, ticketNumber: TicketNumber, newStatus: Företagsbiljett.Status): User {
    if (user.foretagsbiljetter.filter { it.number == ticketNumber }.size != 1) {
      throw TicketNotFoundException(ticketNumber)
    }

    val newForetagsbiljetter = user.foretagsbiljetter.map {
      if (it.number == ticketNumber) {
        it.copy(status = newStatus)
      } else {
        it
      }
    }
    return user.copy(foretagsbiljetter = newForetagsbiljetter)
  }

  @GetMapping(PATH_WITH_ID + "/pay")
  fun getAttendeePaymentInfo(@PathVariable id: UUID): PaymentDTO {
    val showing = findShowing(id)
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
  fun attend(@PathVariable id: UUID, @RequestBody body: AttendInfoDTO): List<Participant> {
    val showing = findShowing(id)
    val userId = currentLoggedInUser()
    assertTicketsNotBought(showing)
    assertUserNotAlreadyAttended(userId, showing)

    val participant: Participant = when (body.paymentOption.type) {
      PaymentType.Företagsbiljett -> {
        val suppliedTicket = body.paymentOption.ticketNumber ?: throw MissingParametersException("företagsbiljett ticket number")
        val ticketNumber = TicketNumber(suppliedTicket)

        assertFöretagsticketIsAvailable(userId, ticketNumber)
        markFöretagsbiljettAsPending(userId, ticketNumber)
        FtgBiljettParticipant(userId, ticketNumber)
      }
      PaymentType.Swish -> SwishParticipant(userId)
    }

    val newParticipants = showing.participants.plus(participant)
    val savedShowing = repo.save(showing.copy(participants = newParticipants))

    return savedShowing.participants.map(Participant::redact)
  }

  private fun markFöretagsbiljettAsPending(userId: UserID, ticketNumber: TicketNumber) {
    val user = getUser(userId)
    val updatedUser = updateFtgbiljettStatusOnUser(user, ticketNumber, Företagsbiljett.Status.Pending)
    userRepo.save(updatedUser)
  }

  @PostMapping(PATH_WITH_ID + "/unattend", produces = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE))
  fun unattend(@PathVariable id: UUID): List<Participant> {
    val showing = repo.findById(id).orElseThrow { NotFoundException("showing '$id'") }
    val userId = currentLoggedInUser()
    assertTicketsNotBought(showing)

    val participantLst = showing.participants.filter { it.hasUserId(userId) }
    if (participantLst.isEmpty()) {
      return showing.participants.map(Participant::redact)
    } else if (participantLst.size > 1) {
      throw AssertionError("Participant $userId has participated more than one time on showing $id")
    }

    val participant = participantLst.first()
    if (participant is FtgBiljettParticipant) {
      markFöretagsbiljettAsAvailable(userId, participant.ticketNumber)
    }

    val participantsWithoutLoggedInUser = showing.participants.minus(participant)
    val savedShowing = repo.save(showing.copy(participants = participantsWithoutLoggedInUser))

    return savedShowing.participants.map(Participant::redact)
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
      participants = setOf(SwishParticipant(admin.id)))
  }

  private fun createInitialPaymentInfo(showing: Showing) {
    val participants = showing.participants.map { participant ->
      paymentInfoRepo.findByShowingIdAndUserId(showing.id, participant.extractUserId())
        .map {
          // Use existing info
          ParticipantPaymentInfo(
            id = it.id,
            userId = participant.extractUserId(),
            showingId = showing.id,
            hasPaid = it.hasPaid || participant is FtgBiljettParticipant,
            amountOwed = it.amountOwed)
        }
        .orElseGet {
          // Create new info
          ParticipantPaymentInfo(userId = participant.extractUserId(),
            showingId = showing.id,
            hasPaid = participant.extractUserId() == showing.payToUser || participant is FtgBiljettParticipant,
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

  private fun assertUserNotAlreadyAttended(userID: UserID, showing: Showing) {
    if (showing.participants.any { it.hasUserId(userID) }) {
      throw UserAlreadyAttendedException()
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

  private fun assertFöretagsticketIsAvailable(userId: UserID, suppliedTicket: TicketNumber) {
    val user = findUser(userId)
    val matchingTickets = user.foretagsbiljetter.filter {
      it.number == suppliedTicket
    }

    if (matchingTickets.isEmpty()) {
      throw TicketNotFoundException(suppliedTicket)
    }
    if (matchingTickets.size > 1) {
      throw DuplicateTicketException(": $suppliedTicket")
    }

    if (matchingTickets.first().status != Företagsbiljett.Status.Available) {
      throw BadRequestException("Ticket has already been used: " + suppliedTicket.number)
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

  private fun getUser(userId: UserID): User {
    return userRepo.findById(userId)
      .orElseThrow { NotFoundException(" user with ID: " + userId) }
  }

  private fun PhoneNumber?.orElseThrow(exceptionSupplier: () -> Exception): PhoneNumber {
    if (this == null) {
      throw exceptionSupplier()
    }
    return this
  }
}
