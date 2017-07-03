package rocks.didit.sefilm.domain

import com.fasterxml.jackson.annotation.JsonValue

data class Bioklubbnummer(val value: String) { // TODO: add isGold()
  init {
    if (value.length != 11) {
      throw IllegalArgumentException("Bioklubbnummer has wrong size. Expected 11, got ${value.length}")
    }
    if (value.toLongOrNull() == null) {
      throw IllegalArgumentException("'$value' is an invalid bioklubbnummer")
    }
  }

  @JsonValue
  override fun toString(): String {
    return value
  }
}