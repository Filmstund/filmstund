package rocks.didit.sefilm.database.entities

import com.fasterxml.jackson.annotation.JsonIgnore
import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import rocks.didit.sefilm.domain.Bioklubbnummer

@Document
data class User(
        val name: String? = null,
        val nick: String? = null,
        @Id
        val email: String = "",
        @JsonIgnore
        val bioklubbnummer: Bioklubbnummer? = null,
        val phone: String? = null
)