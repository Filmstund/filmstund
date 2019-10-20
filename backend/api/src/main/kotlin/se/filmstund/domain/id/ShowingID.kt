package se.filmstund.domain.id

import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonValue
import java.util.*

data class ShowingID(val id: UUID) {
  companion object {
    @JsonCreator
    @JvmStatic
    fun from(value: String?) = value?.let { ShowingID(UUID.fromString(it)) }

    fun random() = ShowingID(UUID.randomUUID())
  }

  @JsonValue
  override fun toString(): String {
    return id.toString()
  }
}