package se.filmstund.domain.dto

import se.filmstund.domain.SEK
import se.filmstund.domain.id.UserID

data class AttendeePaymentDetailsDTO(
  val hasPaid: Boolean = false,
  val amountOwed: SEK = SEK(0),
  val payTo: UserID,
  val swishLink: String? = null,
  val payToPhoneNumber: String = "",
  val payerUserID: UserID
)
