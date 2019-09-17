package rocks.didit.sefilm.domain.dto

import java.util.*

data class AdminPaymentDetailsDTO(
  val showingId: UUID,
  val filmstadenBuyLink: String? = null,
  val participants: List<ParticipantDTO>
)
