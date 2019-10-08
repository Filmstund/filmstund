package rocks.didit.sefilm.database.entities

import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.Id
import javax.persistence.Table

@Entity
@Table
@Deprecated(message = "Don't use JPA")
data class CinemaScreen(
  @Id
  val id: String,

  @Column(nullable = false)
  val name: String
)