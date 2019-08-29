package rocks.didit.sefilm.domain.dto

import rocks.didit.sefilm.database.entities.ParticipantPaymentInfo
import rocks.didit.sefilm.domain.FilmstadenMembershipId
import rocks.didit.sefilm.domain.TicketNumber
import rocks.didit.sefilm.domain.UserID

data class AdminPaymentDetailsDTO(
  val filmstadenBuyLink: String? = null,
  val filmstadenData: List<UserAndFilmstadenData>,
  val participantPaymentInfos: Collection<ParticipantPaymentInfo> = emptyList()
)

data class UserAndFilmstadenData(
  val userId: UserID,
  val filmstadenMembershipId: FilmstadenMembershipId?,
  val foretagsbiljett: TicketNumber?
)