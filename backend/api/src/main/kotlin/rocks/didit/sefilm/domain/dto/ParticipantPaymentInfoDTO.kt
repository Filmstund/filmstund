package rocks.didit.sefilm.domain.dto

import java.util.*

data class ParticipantPaymentInfoDTO(
  val userId: UUID? = null,
  val showingId: UUID? = null,
  val hasPaid: Boolean = false
)

