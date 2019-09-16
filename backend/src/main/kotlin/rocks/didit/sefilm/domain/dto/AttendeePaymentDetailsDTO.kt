package rocks.didit.sefilm.domain.dto

import rocks.didit.sefilm.domain.SEK
import java.util.*

data class AttendeePaymentDetailsDTO(
  val hasPaid: Boolean = false,
  val amountOwed: SEK = SEK(0),
  val payTo: UUID,
  val swishLink: String? = null,
  val payToPhoneNumber: String = "",
  val payerUserID: UUID
)
