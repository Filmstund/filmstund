package rocks.didit.sefilm.domain

data class ParticipantDTO(val userId: UserID, val paymentType: PaymentType)

sealed class Participant {
    abstract val userId: UserID

    fun toDto(): ParticipantDTO {
        val paymentType = when (this) {
            is SwishParticipant -> PaymentType.Swish
            is FtgBiljettParticipant -> PaymentType.Foretagsbiljett
        }
        return ParticipantDTO(this.userId, paymentType)
    }
}

data class SwishParticipant(
        override val userId: UserID
) : Participant()

data class FtgBiljettParticipant(
        override val userId: UserID,
        val ticketNumber: TicketNumber
) : Participant()
