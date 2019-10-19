package rocks.didit.sefilm.domain.dto

import rocks.didit.sefilm.domain.dto.core.ParticipantDTO
import rocks.didit.sefilm.domain.id.ShowingID

data class AdminPaymentDetailsDTO(
  val showingId: ShowingID,
  val filmstadenBuyLink: String? = null,
  val participants: List<ParticipantDTO>
)
