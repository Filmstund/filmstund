package rocks.didit.sefilm.domain.dto

import rocks.didit.sefilm.domain.dto.core.ParticipantDTO
import java.util.*

data class AdminPaymentDetailsDTO(
  val showingId: UUID,
  val filmstadenBuyLink: String? = null,
  val participants: List<ParticipantDTO>
)
