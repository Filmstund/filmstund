package rocks.didit.sefilm.entities

import javax.persistence.Entity
import javax.persistence.GeneratedValue
import javax.persistence.GenerationType
import javax.persistence.Id

@Entity
data class Showing(@Id
                   @GeneratedValue(strategy = GenerationType.AUTO)
                   val id: Long = -1,
                   val name: String)
