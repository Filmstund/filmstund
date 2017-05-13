package rocks.didit.sefilm.domain.dto

import rocks.didit.sefilm.domain.SEK
import rocks.didit.sefilm.domain.UserID

data class PaymentDTO(val hasPaid: Boolean = false,
                      val amountOwed: SEK = SEK(0),
                      val payTo: UserID = UserID(),
                      val swishLink: String? = null,
                      val payerUserID: UserID = UserID())
