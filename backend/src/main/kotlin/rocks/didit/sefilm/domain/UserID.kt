package rocks.didit.sefilm.domain

import com.fasterxml.jackson.annotation.JsonValue

data class UserID(val id: String = "N/A") {
  init {
    if (id.isBlank()) {
      throw IllegalArgumentException("Id may not be blank")
    }
  }

  @JsonValue
  override fun toString() = id
}