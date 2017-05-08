package rocks.didit.sefilm.database.entities

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import rocks.didit.sefilm.domain.SEK
import rocks.didit.sefilm.domain.UserID
import java.util.*

@Document
data class ParticipantInfo(
        @Id
        val id: UUID = UUID.randomUUID(),
        val userId: UserID = UserID(),
        val showingId: UUID = UUID.randomUUID(),
        val hasPayed: Boolean = false,
        val amountOwed: SEK = SEK(0))

