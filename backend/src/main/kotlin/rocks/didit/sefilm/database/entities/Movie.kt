package rocks.didit.sefilm.database.entities

import rocks.didit.sefilm.domain.Imdb
import java.time.Duration
import java.util.*
import javax.persistence.Entity
import javax.persistence.GeneratedValue
import javax.persistence.GenerationType
import javax.persistence.Id

@Entity
data class Movie(
        @Id
        @GeneratedValue(strategy = GenerationType.AUTO)
        val id: UUID = UUID.randomUUID(),
        val name: String,
        val runtime: Duration,
        val imdb: Imdb? = null)