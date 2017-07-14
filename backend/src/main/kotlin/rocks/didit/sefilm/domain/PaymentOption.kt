package rocks.didit.sefilm.domain

enum class PaymentType {
    Swish, Företagsbiljett, Other
}

data class PaymentOption(val type: PaymentType, val extra: String?)