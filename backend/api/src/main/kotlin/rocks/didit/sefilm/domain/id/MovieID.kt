package rocks.didit.sefilm.domain.id

import com.fasterxml.jackson.annotation.JsonValue
import java.util.*

data class MovieID(val id: UUID) {
  companion object {
    fun random() = MovieID(UUID.randomUUID())
  }

  @JsonValue
  override fun toString(): String {
    return id.toString()
  }
}