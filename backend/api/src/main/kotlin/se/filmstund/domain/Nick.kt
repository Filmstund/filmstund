package se.filmstund.domain

import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonValue

data class Nick(val value: String) {
  companion object {
    @JsonCreator
    @JvmStatic
    fun from(str: String?) = str?.let { Nick(it) }
  }

  init {
    require(value.count() <= 50) { "Nick cannot have length > 50" }
  }

  @JsonValue
  override fun toString(): String {
    return value
  }
}