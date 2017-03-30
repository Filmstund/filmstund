package rocks.didit.sefilm.database.entities

import com.fasterxml.jackson.annotation.JsonIgnore
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
        val synopsis: String? = null,
        val originalTitle: String? = null,
        val releaseDate: LocalDate = LocalDate.now(),
        val productionYear: Int? = null,
        val runtime: Duration? = null,
        val poster: String? = null,
        val genres: Collection<String> = emptyList()) {
    init {
        if (imdbId != null && !imdbId.matches(Regex("^tt[0-9]{7}"))) {
            throw IllegalArgumentException("Illegal IMDb ID format: $imdbId")
        }
    }

    /** Should we do an extended query to find more information about this movie? */
    fun needsMoreInfo(): Boolean {
        return synopsis == null || poster == null;
    }

    @JsonIgnore
    fun isMissingImdbId(): Boolean {
        return imdbId.isNullOrBlank()
    }
}