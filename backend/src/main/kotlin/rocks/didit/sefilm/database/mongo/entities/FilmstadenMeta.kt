package rocks.didit.sefilm.database.mongo.entities

import com.fasterxml.jackson.annotation.JsonIgnore
import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import java.time.Instant

@Document
class FilmstadenMeta(
  @Id
  @JsonIgnore
  val key: String = "filmstadenPopulate",
  val timestamp: Instant? = null,
  val description: String = "N/A",
  val value: Any? = null
)