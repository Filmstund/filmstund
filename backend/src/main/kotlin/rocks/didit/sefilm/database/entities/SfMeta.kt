package rocks.didit.sefilm.database.entities

import com.fasterxml.jackson.annotation.JsonIgnore
import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import java.time.Instant

@Document
class SfMeta(
  @Id
  @JsonIgnore
  val key: String = "sfpopulate",
  val timestamp: Instant? = null,
  val description: String = "N/A",
  val value: Any? = null)