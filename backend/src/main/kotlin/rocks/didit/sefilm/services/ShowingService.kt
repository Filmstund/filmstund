package rocks.didit.sefilm.services

import org.springframework.stereotype.Component
import rocks.didit.sefilm.*
import rocks.didit.sefilm.database.entities.Showing
import rocks.didit.sefilm.database.repositories.ParticipantPaymentInfoRepository
import rocks.didit.sefilm.database.repositories.ShowingRepository
import rocks.didit.sefilm.domain.FtgBiljettParticipant
import rocks.didit.sefilm.domain.UserID
import rocks.didit.sefilm.domain.dto.PaymentDTO
import rocks.didit.sefilm.domain.dto.PreBuyInfoDTO
import rocks.didit.sefilm.domain.dto.UserAndSfData
import rocks.didit.sefilm.utils.SwishUtil.Companion.constructSwishUri
import java.time.LocalDate
import java.util.*

@Component
class ShowingService(
  private val showingRepo: ShowingRepository,
  private val paymentInfoRepo: ParticipantPaymentInfoRepository,
  private val movieService: MovieService,
  private val userService: UserService,
  private val sfService: SFService,
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

  private fun Showing.userIsInvolvedInThisShowing(userID: UserID): Boolean {
    return this.isAdmin(userID) || this.isParticipantInShowing(userID)
      || this.payToUser == userID
  }

  private fun Showing.isAdmin(userID: UserID): Boolean
    = this.admin == userID

  private fun Showing.isParticipantInShowing(userID: UserID): Boolean
    = this.participants.any { it.hasUserId(userID) }
}