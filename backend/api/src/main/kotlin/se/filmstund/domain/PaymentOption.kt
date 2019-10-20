package se.filmstund.domain

enum class PaymentType {
  Swish, GiftCertificate
}

data class PaymentOption(val type: PaymentType, val ticketNumber: String? = null)
