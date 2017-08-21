package rocks.didit.sefilm.domain

sealed class Participant() {
  fun hasUserId(userId: UserID): Boolean {
    return userId == extractUserId()
  }

  fun extractUserId(): UserID {
    return when (this) {
      is SwishParticipant -> this.userId
      is FtgBiljettParticipant -> this.userId
      is RedactedParticipant -> this.userId
    }
  }
}

data class SwishParticipant(val userId: UserID) : Participant()
data class FtgBiljettParticipant(val userId: UserID, val ticketNumber: TicketNumber) : Participant()

/** Used when the participant is to be shown to end users and certain information is to be left out, e.g. the ticket number */
data class RedactedParticipant(val userId: UserID, val paymentType: PaymentType) : Participant()