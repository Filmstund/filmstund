package rocks.didit.sefilm.database.entities

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import rocks.didit.sefilm.domain.Bioklubbnummer
import java.util.*

@Document
data class User(
        @Id
        val id: UUID = UUID.randomUUID(),
        val name: String? = null,
        val nick: String? = null,
        val email: String? = null,
        val bioklubbnummer: Bioklubbnummer? = null,
        val phone: String? = null
)