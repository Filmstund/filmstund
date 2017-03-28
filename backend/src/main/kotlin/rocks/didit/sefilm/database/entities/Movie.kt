package rocks.didit.sefilm.database.entities

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import java.time.Duration

@Document
data class Movie(
        @Id
        val id: String = "",
        val name: String = "",
        val runtime: Duration = Duration.ZERO) {
    init {
        if (id.isNotEmpty() && !id.matches(Regex("^tt[0-9]{7}"))) {
            throw IllegalArgumentException("Illegal ID format: $id")
        }
    }
}