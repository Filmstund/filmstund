package rocks.didit.sefilm.domain

enum class PaymentType {
  Swish, Företagsbiljett
}

data class PaymentOption(val type: PaymentType, val ticketNumber: String? = null)