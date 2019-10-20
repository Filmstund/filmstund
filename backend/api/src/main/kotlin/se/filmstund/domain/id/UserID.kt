package se.filmstund.domain.id

import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonValue
import java.util.*

data class UserID(val id: UUID) {
  companion object {
    @JsonCreator
    @JvmStatic
    fun from(value: String?) = value?.let { UserID(UUID.fromString(it)) }

    fun random() = UserID(UUID.randomUUID())
  }

  @JsonValue
  override fun toString(): String {
    return id.toString()
  }
}