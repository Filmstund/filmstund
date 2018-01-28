package rocks.didit.sefilm.database.entities

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document

@Document
data class BioBudord(
  @Id
  val number: Long = -1,
  val phrase: String = ""
)