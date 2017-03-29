package rocks.didit.sefilm.database.entities

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import java.time.Duration
import java.time.LocalDate
import java.util.*

@Document
data class Movie(
        @Id
        val id: UUID = UUID.randomUUID(),
        val imdbId: String? = null,
        val sfId: String? = null,
        val title: String = "",
        val originalTitle: String? = null,
        val releaseDate: LocalDate = LocalDate.now(),
        val runtime: Duration? = null,
        val poster: String? = null) {
    init {
        if (imdbId != null && !imdbId.matches(Regex("^tt[0-9]{7}"))) {
            throw IllegalArgumentException("Illegal IMDb ID format: $imdbId")
        }
    }
}