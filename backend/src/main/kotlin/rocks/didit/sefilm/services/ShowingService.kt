package rocks.didit.sefilm.services

import org.springframework.stereotype.Component
import rocks.didit.sefilm.*
import rocks.didit.sefilm.database.entities.Showing
import rocks.didit.sefilm.database.repositories.ParticipantPaymentInfoRepository
import rocks.didit.sefilm.database.repositories.ShowingRepository
import rocks.didit.sefilm.domain.*
import rocks.didit.sefilm.domain.dto.*
import rocks.didit.sefilm.utils.SwishUtil.Companion.constructSwishUri
import java.time.LocalDate
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
  fun getPreBuyInfo(showingId: UUID): PreBuyInfoDTO {
    val showing = getShowingOrThrow(showingId)
    assertionService.assertLoggedInUserIsAdmin(showing)

    // Note that this list is empty before the showing has been marked as bought
    val paymentInfos = paymentInfoRepo.findByShowingId(showingId)
    val ticketMap = showing.participants.map {
      val user = userService.getCompleteUser(it.extractUserId()).orElseThrow { NotFoundException("user", it.extractUserId(), showingId) }
      val ftgTicket = (it as? FtgBiljettParticipant)?.ticketNumber
      UserAndSfData(user.id, user.sfMembershipId, ftgTicket)
    }

    return PreBuyInfoDTO(sfService.getSfBuyLink(showing.movieId), ticketMap, paymentInfos)
  }

  /** Info a user needs for paying the one who bought the tickets */
  fun getPaymentInfo(showingId: UUID): PaymentDTO {
    val showing = getShowingOrThrow(showingId)
    val payeePhone = userService.getCompleteUser(showing.payToUser)
      ?.phone
      .orElseThrow { MissingPhoneNumberException(showing.payToUser) }

    val currentUser = currentLoggedInUser()
    val participantInfo = paymentInfoRepo
      .findByShowingIdAndUserId(showingId, currentUser)
      .orElseThrow { PaymentInfoMissing(showingId) }

    val movieTitle = movieService
      .getMovie(showing.movieId)
      ?.title
      .orElseThrow { NotFoundException("movie with id " + showing.movieId) }

    val swishTo = when {
      !participantInfo.hasPaid && participantInfo.amountOwed.ören > 0 -> constructSwishUri(showing, payeePhone, participantInfo, movieTitle)
      else -> null
    }

    return PaymentDTO(participantInfo.hasPaid, participantInfo.amountOwed, showing.payToUser, swishTo, currentUser)
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

}