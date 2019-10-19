package rocks.didit.sefilm.domain.dto

import rocks.didit.sefilm.domain.SEK
import rocks.didit.sefilm.domain.id.ShowingID
import rocks.didit.sefilm.domain.id.UserID

data class ParticipantPaymentInfoDTO(
  val userId: UserID? = null,
  val showingId: ShowingID? = null,
  val hasPaid: Boolean = false,
  val amountOwed: SEK? = null
)

