package rocks.didit.sefilm.domain

@Deprecated(message = "")
data class ParticipantDTO(val userId: GoogleId, val paymentType: PaymentType)

@Deprecated(message = "")
sealed class Participant {
  abstract val userId: GoogleId

  fun toDto(): ParticipantDTO {
    val paymentType = when (this) {
      is SwishParticipant -> PaymentType.Swish
      is FtgBiljettParticipant -> PaymentType.GiftCertificate
    }
    return ParticipantDTO(this.userId, paymentType)
  }
}

@Deprecated(message = "")
data class SwishParticipant(
  override val userId: GoogleId
) : Participant()

@Deprecated(message = "")
data class FtgBiljettParticipant(
  override val userId: GoogleId,
  val ticketNumber: TicketNumber
) : Participant()
