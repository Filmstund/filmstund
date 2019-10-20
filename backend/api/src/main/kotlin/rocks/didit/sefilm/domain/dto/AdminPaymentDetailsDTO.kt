package rocks.didit.sefilm.domain.dto

import rocks.didit.sefilm.domain.dto.core.AttendeeDTO
import rocks.didit.sefilm.domain.id.ShowingID

data class AdminPaymentDetailsDTO(
  val showingId: ShowingID,
  val filmstadenBuyLink: String? = null,
  val attendees: List<AttendeeDTO>
)
