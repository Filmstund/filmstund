package rocks.didit.sefilm.domain.dto

import rocks.didit.sefilm.domain.SEK
import rocks.didit.sefilm.domain.id.UserID
import java.util.*

data class ParticipantPaymentInfoDTO(
  val userId: UserID? = null,
  val showingId: UUID? = null,
  val hasPaid: Boolean = false,
  val amountOwed: SEK? = null
)

