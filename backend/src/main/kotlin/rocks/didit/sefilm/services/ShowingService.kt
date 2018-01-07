package rocks.didit.sefilm.services

import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import rocks.didit.sefilm.*
import rocks.didit.sefilm.database.entities.Movie
import rocks.didit.sefilm.database.entities.ParticipantPaymentInfo
import rocks.didit.sefilm.database.entities.Showing
import rocks.didit.sefilm.database.repositories.ParticipantPaymentInfoRepository
import rocks.didit.sefilm.database.repositories.ShowingRepository
import rocks.didit.sefilm.domain.*
import rocks.didit.sefilm.domain.dto.*
import rocks.didit.sefilm.utils.SwishUtil.Companion.constructSwishUri
import java.time.Duration
import java.time.LocalDate
import java.time.ZoneId
import java.time.ZonedDateTime
import java.util.*

@Component
class ShowingService(
  private val showingRepo: ShowingRepository,
  private val paymentInfoRepo: ParticipantPaymentInfoRepository,
  private val movieService: MovieService,
  private val userService: UserService,
  private val ticketService: TicketService,
  private val googleCalenderService: GoogleCalenderService,
  private val sfService: SFService,
  private val locationService: LocationService,
  private val assertionService: AssertionService) {

  companion object {
    private val log: Logger = LoggerFactory.getLogger(ShowingService::class.java)
  }

  fun getAllPublicShowings(afterDate: LocalDate = LocalDate.MIN): List<Showing>
    = showingRepo.findByPrivateOrderByDateDesc(false).toList()
    .filter { it.date?.isAfter(afterDate) ?: false }

  fun getShowing(id: UUID): Showing? = showingRepo.findById(id).orElse(null)
  fun getShowingOrThrow(id: UUID): Showing = getShowing(id) ?: throw NotFoundException(what = "showing", showingId = id)
  fun getShowingByMovie(movieId: UUID): List<Showing> = showingRepo.findByMovieIdOrderByDateDesc(movieId)

  fun getPrivateShowingsForCurrentUser(afterDate: LocalDate = LocalDate.MIN): List<Showing> {
    val currentLoggedInUser = currentLoggedInUser()
    return showingRepo.findByPrivateOrderByDateDesc(true)
      .filter { it.userIsInvolvedInThisShowing(currentLoggedInUser) }
  }

  /** Info that is needed before you buy the tickets at SF */
  fun getAdminPaymentDetails(showingId: UUID): AdminPaymentDetailsDTO {
    val showing = getShowingOrThrow(showingId)
    assertionService.assertLoggedInUserIsAdmin(showing)

    // Note that this list is empty before the showing has been marked as bought
    val paymentInfos = paymentInfoRepo.findByShowingId(showingId)
    val ticketMap = showing.participants.map {
      val user = userService.getCompleteUser(it.extractUserId()).orElseThrow { NotFoundException("user", it.extractUserId(), showingId) }
      val ftgTicket = (it as? FtgBiljettParticipant)?.ticketNumber
      UserAndSfData(user.id, user.sfMembershipId, ftgTicket)
    }

    return AdminPaymentDetailsDTO(sfService.getSfBuyLink(showing.movieId), ticketMap, paymentInfos)
  }

  /** Info a user needs for paying the one who bought the tickets */
  fun getAttendeePaymentDetails(showingId: UUID): AttendeePaymentDetailsDTO {
    val showing = getShowingOrThrow(showingId)
    val payeePhone = userService.getCompleteUser(showing.payToUser)
      ?.phone
      .orElseThrow { MissingPhoneNumberException(showing.payToUser) }

    val currentUser = currentLoggedInUser()
    val participantInfo = paymentInfoRepo
      .findByShowingIdAndUserId(showingId, currentUser)
      .orElseThrow { PaymentInfoMissing(showingId) }

    val movieTitle = movieService.getMovieOrThrow(showing.movieId).title

    val swishTo = when {
      !participantInfo.hasPaid && participantInfo.amountOwed.ören > 0 -> constructSwishUri(showing, payeePhone, participantInfo, movieTitle)
      else -> null
    }

    return AttendeePaymentDetailsDTO(participantInfo.hasPaid, participantInfo.amountOwed, showing.payToUser, swishTo, currentUser)
  }

  fun attendShowing(showingId: UUID, paymentOption: PaymentOption): Showing {
    val showing = getShowingOrThrow(showingId)
    val userId = currentLoggedInUser()
    assertionService.assertTicketsNotBought(userId, showing)
    assertionService.assertUserNotAlreadyAttended(userId, showing)

    val participant: Participant = createParticipantBasedOnPaymentType(paymentOption, userId)

    val newParticipants = showing.participants.plus(participant)
    return showingRepo.save(showing.copy(participants = newParticipants))

  }

  fun unattendShowing(showingId: UUID): Showing {
    val showing = getShowingOrThrow(showingId)
    val userId = currentLoggedInUser()
    assertionService.assertTicketsNotBought(userId, showing)

    val participantLst = showing
      .participants
      .filter { it.hasUserId(userId) }

    if (participantLst.isEmpty()) {
      return showing
    } else if (participantLst.size > 1) {
      throw AssertionError("Participant $userId has participated more than one time on showing $showingId")
    }

    val participant = participantLst.first()

    val participantsWithoutLoggedInUser = showing.participants.minus(participant)
    return showingRepo.save(showing.copy(participants = participantsWithoutLoggedInUser))

  }

  fun createShowing(data: ShowingDTO): Showing {
    if (data.date == null || data.location == null || data.movieId == null || data.time == null) throw MissingParametersException()
    if (!movieService.movieExists(data.movieId)) {
      throw NotFoundException("movie '${data.movieId}'. Can't create showing for movie that does not exist")
    }

    val adminUser = userService.currentUser().toLimitedUserDTO()
    return showingRepo.save(data.toShowing(adminUser))
  }

  /** Delete the selected showing and return all public showings */
  fun deleteShowing(showingId: UUID): List<Showing> {
    val showing = getShowingOrThrow(showingId)
    assertionService.assertLoggedInUserIsAdmin(showing)

    if (showing.calendarEventId != null) {
      googleCalenderService.deleteEvent(showing.calendarEventId)
    }

    paymentInfoRepo.deleteByShowingIdAndUserId(showing.id, currentLoggedInUser())
    showingRepo.delete(showing)
    ticketService.deleteTickets(showing)
    return getAllPublicShowings()
  }

  fun createCalendarEvent(showingId: UUID): Showing {
    val showing = getShowingOrThrow(showingId)
    assertionService.assertLoggedInUserIsAdmin(showing)
    if (!showing.calendarEventId.isNullOrBlank()) throw BadRequestException("Calendar event already created")
    if (showing.movieId == null) throw IllegalArgumentException("Missing movie ID for showing ${showing.id}")

    val movie = movieService.getMovieOrThrow(showing.movieId)
    val runtime = movie.getDurationOrDefault2hours()
    val participantEmails = userService.getParticipantEmailAddresses(showing.participants)
    val zoneId = ZoneId.of("Europe/Stockholm")
    val event = CalendarEventDTO.of(
      summary = movie.title,
      location = showing.location,
      emails = participantEmails,
      start = ZonedDateTime.of(showing.date, showing.time, zoneId).plusSeconds(1),
      end = ZonedDateTime.of(showing.date, showing.time, zoneId).plus(runtime).plusSeconds(1),
      sfBuyLink = sfService.getSfBuyLink(movie.id) ?: ""
    )

    log.info("Creating calendar event for showing '${showing.id}' and ${participantEmails.size} participants")
    val createdEventId = googleCalenderService.createEvent(event)
    val updatedShowing = showing.copy(calendarEventId = createdEventId)
    return showingRepo.save(updatedShowing)
  }

  fun deleteCalendarEvent(showingId: UUID): Showing {
    val showing = getShowingOrThrow(showingId)
    assertionService.assertLoggedInUserIsAdmin(showing)
    if (showing.calendarEventId == null) throw IllegalArgumentException("Calendar event hasn't been created")

    googleCalenderService.deleteEvent(showing.calendarEventId)
    return showingRepo.save(showing.copy(calendarEventId = null))
  }

  fun markAsBought(showingId: UUID): Showing {
    val showing = getShowingOrThrow(showingId)
    assertionService.assertLoggedInUserIsAdmin(showing)
    assertionService.assertUserHasPhoneNumber(showing.admin)

    if (showing.ticketsBought) {
      log.info("Showing $showingId is already bought")
      return showing
    }

    createInitialPaymentInfo(showing)
    return showingRepo.save(showing.copy(ticketsBought = true))
  }

  fun updateShowing(showingId: UUID, newValues: UpdateShowingDTO): Showing {
    val showing = getShowingOrThrow(showingId)
    assertionService.assertLoggedInUserIsAdmin(showing)

    log.info("Updating showing ($showingId) to new values: $newValues")
    return showingRepo.save(showing.copy(
      price = SEK(newValues.price),
      private = newValues.private,
      payToUser = userService.getUserOrThrow(UserID(newValues.payToUser)).id,
      expectedBuyDate = newValues.expectedBuyDate,
      location = locationService.getOrCreateNewLocation(newValues.location),
      time = newValues.time
    ))
  }

  private fun createParticipantBasedOnPaymentType(paymentOption: PaymentOption, userId: UserID): Participant
    = when (paymentOption.type) {
    PaymentType.Foretagsbiljett -> {
      val suppliedTicket
        = paymentOption.ticketNumber
        ?: throw MissingParametersException("User chose to pay with a företagsbiljett, but no ticket number were supplied")
      val ticketNumber = TicketNumber(suppliedTicket)

      assertionService.assertForetagsbiljettIsAvailable(userId, ticketNumber)
      FtgBiljettParticipant(userId, ticketNumber)
    }
    PaymentType.Swish -> SwishParticipant(userId)
  }

  private fun Showing.userIsInvolvedInThisShowing(userID: UserID): Boolean {
    return this.isAdmin(userID) || this.isParticipantInShowing(userID)
      || this.payToUser == userID
  }

  private fun Showing.isAdmin(userID: UserID): Boolean
    = this.admin == userID

  private fun Showing.isParticipantInShowing(userID: UserID): Boolean
    = this.participants.any { it.hasUserId(userID) }

  /* Fetch location from db or create it if it does not exist before converting the showing */
  private fun ShowingDTO.toShowing(admin: LimitedUserDTO): Showing {
    if (this.location == null) {
      throw IllegalArgumentException("Location may not be null")
    }
    val location = locationService.getOrCreateNewLocation(this.location)
    return Showing(date = this.date,
      time = this.time,
      movieId = this.movieId,
      location = location,
      admin = admin.id,
      payToUser = admin.id,
      expectedBuyDate = this.expectedBuyDate,
      participants = setOf(SwishParticipant(admin.id)))
  }

  private fun Movie.getDurationOrDefault2hours()
    = when {
    this.runtime.isZero -> Duration.ofHours(2).plusMinutes(30)
    else -> this.runtime
  }

  private fun createInitialPaymentInfo(showing: Showing) {
    val participants = showing
      .participants
      .map { it ->
        val userId = it.extractUserId()
        val hasPaid = userId == showing.payToUser || it is FtgBiljettParticipant
        ParticipantPaymentInfo(userId = userId,
          showingId = showing.id,
          hasPaid = hasPaid,
          amountOwed = if (hasPaid || showing.price == null) SEK(0) else showing.price)
      }
    paymentInfoRepo.saveAll(participants)
  }

}