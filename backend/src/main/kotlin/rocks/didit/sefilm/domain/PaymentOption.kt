package rocks.didit.sefilm.domain

enum class PaymentType {
    Swish, Foretagsbiljett
}

data class PaymentOption(val type: PaymentType, val ticketNumber: String? = null)
