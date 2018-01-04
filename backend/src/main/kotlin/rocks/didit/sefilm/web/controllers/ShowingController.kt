package rocks.didit.sefilm.web.controllers

import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.access.AccessDeniedException
import org.springframework.web.bind.annotation.*
import org.springframework.web.util.UriComponentsBuilder
import rocks.didit.sefilm.*
import rocks.didit.sefilm.database.entities.*
import rocks.didit.sefilm.database.repositories.*
import rocks.didit.sefilm.domain.*
import rocks.didit.sefilm.domain.dto.*
import rocks.didit.sefilm.domain.dto.ResponseStatusDTO.SuccessfulStatusDTO
import rocks.didit.sefilm.services.FöretagsbiljettService
import rocks.didit.sefilm.services.GoogleCalenderService
import rocks.didit.sefilm.services.TicketService
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
                        private val ticketService: TicketService,
                        private val googleCalenderService: GoogleCalenderService,
                        private val foretagsbiljettService: FöretagsbiljettService) {
  companion object {
    private const val PATH = Application.API_BASE_PATH + "/showings"
    private const val PATH_WITH_ID = PATH + "/{id}"
  }

  private val log = LoggerFactory.getLogger(ShowingController::class.java)

  @GetMapping(PATH, produces = [(MediaType.APPLICATION_JSON_UTF8_VALUE)])
  fun findAll(): List<Showing> {
    val showings = repo.findByPrivateOrderByDateDesc(false)
    val fromThisDate = ZonedDateTime.now().minusDays(7).toLocalDate()
    return showings
      .filter { it.date?.isAfter(fromThisDate) ?: false }
      .map(Showing::withoutSensitiveFields)
  }

  @GetMapping(PATH_WITH_ID, produces = [(MediaType.APPLICATION_JSON_UTF8_VALUE)])
  fun findOne(@PathVariable id: UUID): Showing = repo.findById(id).map(Showing::withoutSensitiveFields).orElseThrow { NotFoundException("showing '$id") }

  private fun findShowing(id: UUID) = repo.findById(id).orElseThrow { NotFoundException("showing '$id'") }

  @PutMapping(PATH_WITH_ID, consumes = [(MediaType.APPLICATION_JSON_UTF8_VALUE)], produces = [(MediaType.APPLICATION_JSON_UTF8_VALUE)])
  fun updateShowing(@PathVariable id: UUID, @RequestBody body: UpdateShowingDTO): Showing {
    val showing = findShowing(id)
    assertLoggedInUserIsAdmin(showing)
    assertUserHasPhoneNumber(showing.admin)

    val newPayToUser = when {
      body.payToUser != null -> UserID(body.payToUser)
      else -> showing.payToUser
    }
    val newLocation = when {
      body.location != null -> {
        locationRepo.findById(body.location)
          .orElseGet { locationRepo.save(Location(body.location)) }
      }
      else -> showing.location
    }

    val updateShowing = showing.copy(
      price = SEK(body.price),
      private = body.private,
      ticketsBought = body.ticketsBought,
      expectedBuyDate = body.expectedBuyDate,
      payToUser = newPayToUser,
      time = body.time ?: showing.time,
      location = newLocation)

    val updatedShowing = repo.save(updateShowing)
    if (body.ticketsBought) {
      createInitialPaymentInfo(updateShowing)
    }

    if (body.cinemaTicketUrls.isNotEmpty()) {
      ticketService.processTickets(body.cinemaTicketUrls, updatedShowing.id)
    }

    return updatedShowing
  }

  @DeleteMapping(PATH_WITH_ID, produces = [(MediaType.APPLICATION_JSON_UTF8_VALUE)])
  fun deleteShowing(@PathVariable id: UUID): SuccessfulStatusDTO {
    val showing = findShowing(id)
    assertLoggedInUserIsAdmin(showing)

    if (showing.calendarEventId != null) {
      googleCalenderService.deleteEvent(showing.calendarEventId)
    }

    paymentInfoRepo.deleteByShowingIdAndUserId(showing.id, currentLoggedInUser())
    repo.delete(showing)
    ticketService.deleteTickets(showing)

    return SuccessfulStatusDTO("Showing with id ${showing.id} were removed successfully")
  }

  @PostMapping(PATH_WITH_ID + "/invite/googlecalendar", consumes = [(MediaType.APPLICATION_JSON_UTF8_VALUE)], produces = [(MediaType.APPLICATION_JSON_UTF8_VALUE)])
  fun createGoogleCalendarEvent(@PathVariable id: UUID): ResponseStatusDTO {
    val showing = findShowing(id)
    assertLoggedInUserIsAdmin(showing)
    if (!showing.calendarEventId.isNullOrBlank()) throw BadRequestException("Calendar event already created")
    if (showing.movieId == null) throw BadRequestException("Missing movie ID for showing ${showing.id}")

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
    val createdEventId = googleCalenderService.createEvent(event)
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

  @GetMapping(PATH_WITH_ID + "/pay")
  fun getAttendeePaymentInfo(@PathVariable id: UUID): PaymentDTO {
    val showing = findShowing(id)
    val payeePhone = findUser(showing.payToUser)
      .phone
      .orElseThrow { MissingPhoneNumberException(showing.payToUser) }

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

  @PostMapping(PATH, consumes = [(MediaType.APPLICATION_JSON_UTF8_VALUE)], produces = [(MediaType.APPLICATION_JSON_UTF8_VALUE)])
  @ResponseStatus(HttpStatus.CREATED)
  fun createShowing(@RequestBody body: ShowingDTO, b: UriComponentsBuilder): ResponseEntity<Showing> {
    if (body.date == null || body.location == null || body.movieId == null || body.time == null) throw MissingParametersException()
    if (!movieRepo.existsById(body.movieId)) {
      throw NotFoundException("movie '${body.movieId}'. Can't create showing for movie that does not exist")
    }

    val adminUser = userRepo
      .findById(currentLoggedInUser())
      .map(User::toLimitedUserDTO)
      .orElseThrow { NotFoundException("Current logged in user not found in db") }

    val savedShowing = repo.save(body.toShowing(adminUser))
    val newLocation = b.path(PATH_WITH_ID).buildAndExpand(savedShowing.id).toUri()
    return ResponseEntity.created(newLocation).body(savedShowing)
  }

  @PostMapping(PATH_WITH_ID + "/attend", produces = [(MediaType.APPLICATION_JSON_UTF8_VALUE)])
  fun attend(@PathVariable id: UUID, @RequestBody body: AttendInfoDTO): List<Participant> {
    val showing = findShowing(id)
    val userId = currentLoggedInUser()
    assertTicketsNotBought(showing)
    assertUserNotAlreadyAttended(userId, showing)

    val participant: Participant = when (body.paymentOption.type) {
      PaymentType.Företagsbiljett -> {
        val suppliedTicket = body.paymentOption.ticketNumber ?: throw MissingParametersException("företagsbiljett ticket number")
        val ticketNumber = TicketNumber(suppliedTicket)

        assertForetagsbiljettIsAvailable(userId, ticketNumber)
        FtgBiljettParticipant(userId, ticketNumber)
      }
      PaymentType.Swish -> SwishParticipant(userId)
    }

    val newParticipants = showing.participants.plus(participant)
    val savedShowing = repo.save(showing.copy(participants = newParticipants))

    return savedShowing.participants.map(Participant::redact)
  }

  @PostMapping(PATH_WITH_ID + "/unattend", produces = [(MediaType.APPLICATION_JSON_UTF8_VALUE)])
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

    val participantsWithoutLoggedInUser = showing.participants.minus(participant)
    val savedShowing = repo.save(showing.copy(participants = participantsWithoutLoggedInUser))

    return savedShowing.participants.map(Participant::redact)
  }

  /* Fetch location from db or create it if it does not exist before converting the showing */
  private fun ShowingDTO.toShowing(admin: LimitedUserDTO): Showing {
    if (this.location == null) {
      throw IllegalArgumentException("Location may not be null")
    }
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
      throw UserAlreadyAttendedException(userID)
    }
  }

  private fun assertLoggedInUserIsAdmin(showing: Showing) {
    if (currentLoggedInUser() != showing.admin) {
      throw AccessDeniedException("Only the showing admin is allowed to do that")
    }
  }

  private fun assertUserHasPhoneNumber(userID: UserID) {
    val user = findUser(userID)
    if (user.phone == null || user.phone.number.isBlank()) {
      throw MissingPhoneNumberException(userID)
    }
  }

  private fun assertForetagsbiljettIsAvailable(userId: UserID, suppliedTicket: TicketNumber) {
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

    if (foretagsbiljettService.getStatusOfTicket(matchingTickets.first()) != Företagsbiljett.Status.Available) {
      throw BadRequestException("Ticket has already been used: " + suppliedTicket.number)
    }
  }

  private fun constructSwishUri(showing: Showing, payeePhone: PhoneNumber, participantInfo: ParticipantPaymentInfo): String {
    if (showing.movieId == null) {
      throw IllegalArgumentException("Missing movie ID for showing ${showing.id}")
    }
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
    if (showing.movieId == null) {
      throw IllegalArgumentException("Missing movie ID for showing ${showing.id}")
    }
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
