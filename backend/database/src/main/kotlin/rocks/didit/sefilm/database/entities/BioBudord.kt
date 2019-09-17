package rocks.didit.sefilm.database.entities

import javax.persistence.Entity
import javax.persistence.Id
import javax.persistence.Table

@Entity
@Table
data class BioBudord(
  @Id
  val number: Long = -1,
  val phrase: String = ""
)