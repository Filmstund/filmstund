package rocks.didit.sefilm.domain

sealed class Participant() {
  fun hasUserId(userID: UserID): Boolean {
    return userID == extractUserId()
  }

  fun extractUserId(): UserID {
    return when (this) {
      is SwishParticipant -> this.userID
      is FtgBiljettParticipant -> this.userID
      is RedactedParticipant -> this.userID
    }
  }
}

data class SwishParticipant(val userID: UserID) : Participant()
data class FtgBiljettParticipant(val userID: UserID, val ticketNumber: TicketNumber) : Participant()

/** Used when the participant is to be shown to end users and certain information is to be left out, e.g. the ticket number */
data class RedactedParticipant(val userID: UserID, val paymentType: PaymentType) : Participant()