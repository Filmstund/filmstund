package rocks.didit.sefilm.database.entities

import java.time.Instant
import java.util.*
import javax.persistence.*

@Entity
data class Showing(@Id
                   @GeneratedValue(strategy = GenerationType.AUTO)
                   val id: UUID = UUID.randomUUID(),
                   val startTime: Instant,
                   @ManyToOne
                   val movie: Movie,
                   @ManyToOne
                   val location: Location,
                   @ManyToOne
                   val admin: User,
                   @ManyToMany()
                   @JoinTable(name = "showing_participants",
                           joinColumns = arrayOf(JoinColumn(name = "showing_id", referencedColumnName = "id")),
                           inverseJoinColumns = arrayOf(JoinColumn(name="user_id", referencedColumnName = "id")))
                   val participants: Collection<User>
)
