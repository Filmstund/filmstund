package rocks.didit.sefilm.database.mongo.entities

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import rocks.didit.sefilm.domain.SEK
import rocks.didit.sefilm.domain.id.GoogleId
import java.util.*

@Document(collection = "participantInfo")
@Deprecated(message = "")
internal data class ParticipantPaymentInfo(
  @Id
  val id: UUID = UUID.randomUUID(),
  val userId: GoogleId = GoogleId.MISSING,
  val showingId: UUID = UUID.randomUUID(),
  val hasPaid: Boolean = false,
  val amountOwed: SEK = SEK(0)
)


