package rocks.didit.sefilm.domain

import com.fasterxml.jackson.annotation.JsonValue

data class GoogleId(val id: String) {
  companion object {
    val MISSING = GoogleId("N/A")
  }

  init {
    require(!id.isBlank()) { "Id may not be blank" }
  }

  @JsonValue
  override fun toString() = id
}