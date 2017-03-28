package rocks.didit.sefilm.database.entities

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import java.time.Instant
import java.util.*

@Document
data class Showing(@Id
                   val id: UUID = UUID.randomUUID(),
                   val startTime: Instant? = null,
                   val movie: Movie? = null,
                   val location: Location? = null,
                   val admin: User? = null,
                   val participants: Collection<User> = listOf()
)
