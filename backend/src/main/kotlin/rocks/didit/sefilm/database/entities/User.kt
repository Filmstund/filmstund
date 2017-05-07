package rocks.didit.sefilm.database.entities

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import rocks.didit.sefilm.domain.Bioklubbnummer
import rocks.didit.sefilm.domain.UserID

@Document
data class User(
        @Id
        val id: UserID = UserID("N/A"),
        val name: String? = null,
        val nick: String? = null,
        val email: String = "",
        val bioklubbnummer: Bioklubbnummer? = null,
        val phone: String? = null,
        val avatar: String? = null
)