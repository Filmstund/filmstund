package rocks.didit.sefilm.domain

import se.filmstund.domain.id.GoogleId
import se.filmstund.domain.id.TicketNumber

@Deprecated(message = "")
sealed class Participant {
  abstract val userId: GoogleId
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
