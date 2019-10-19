package rocks.didit.sefilm.domain.id

import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonValue
import java.util.*

data class MovieID(val id: UUID) {
  companion object {
    @JsonCreator
    @JvmStatic
    fun from(value: String?) = value?.let { MovieID(UUID.fromString(it)) }

    fun random() = MovieID(UUID.randomUUID())
  }

  @JsonValue
  override fun toString(): String {
    return id.toString()
  }
}