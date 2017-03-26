package rocks.didit.sefilm.database.entities

import com.fasterxml.jackson.annotation.JsonIgnore
import rocks.didit.sefilm.domain.Bioklubbnummer
import java.util.*
import javax.persistence.*

@Entity
@Table(name = "users")
data class User(
        @Id
        @GeneratedValue(strategy = GenerationType.AUTO)
        val id: UUID = UUID.randomUUID(),
        val name: String,
        val nick: String?,
        val email: String,
        val bioklubbnummer: Bioklubbnummer,
        val phone: String,
        @JsonIgnore
        @ManyToMany(mappedBy = "participants")
        val showings: Collection<Showing>
)