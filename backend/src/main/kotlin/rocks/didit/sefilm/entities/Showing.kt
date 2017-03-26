package rocks.didit.sefilm.entities

import java.util.*
import javax.persistence.Entity
import javax.persistence.GeneratedValue
import javax.persistence.GenerationType
import javax.persistence.Id

@Entity
data class Showing(@Id
                   @GeneratedValue(strategy = GenerationType.AUTO)
                   val id: UUID = UUID.randomUUID(),
                   val name: String)
