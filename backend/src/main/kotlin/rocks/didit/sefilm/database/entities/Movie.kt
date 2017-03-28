package rocks.didit.sefilm.database.entities

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import rocks.didit.sefilm.domain.Imdb
import java.time.Duration
import java.util.*

@Document
data class Movie(
        @Id
        val id: UUID = UUID.randomUUID(),
        val name: String = "",
        val runtime: Duration = Duration.ZERO,
        val imdb: Imdb? = null)