package se.filmstund.domain.dto

import se.filmstund.domain.SEK
import se.filmstund.domain.id.ShowingID
import se.filmstund.domain.id.UserID

data class AttendeePaymentInfoDTO(
  val userId: UserID? = null,
  val showingId: ShowingID? = null,
  val hasPaid: Boolean = false,
  val amountOwed: SEK? = null
)

