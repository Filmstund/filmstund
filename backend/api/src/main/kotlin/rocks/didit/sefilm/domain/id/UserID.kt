package rocks.didit.sefilm.domain.id

import com.fasterxml.jackson.annotation.JsonValue
import java.util.*

data class UserID(val id: UUID) {
  companion object {
    fun random() = UserID(UUID.randomUUID())
  }

  @JsonValue
  override fun toString(): String {
    return id.toString()
  }
}