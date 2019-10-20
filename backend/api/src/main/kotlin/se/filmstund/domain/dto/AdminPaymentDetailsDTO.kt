package se.filmstund.domain.dto

import se.filmstund.domain.dto.core.AttendeeDTO
import se.filmstund.domain.id.ShowingID

data class AdminPaymentDetailsDTO(
  val showingId: ShowingID,
  val filmstadenBuyLink: String? = null,
  val attendees: List<AttendeeDTO>
)
