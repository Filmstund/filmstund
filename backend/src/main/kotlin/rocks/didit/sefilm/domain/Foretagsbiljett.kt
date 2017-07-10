package rocks.didit.sefilm.domain

import com.fasterxml.jackson.annotation.JsonValue

data class Foretagsbiljett(val value: String) {
  init {
    if (value.length != 11) {
      throw IllegalArgumentException("Företagsbiljett has wrong size. Expected 11, got ${value.length}")
    }
    if (value.toLongOrNull() == null) {
      throw IllegalArgumentException("'$value' is an invalid företagsbiljett")
    }
  }

  @JsonValue
  override fun toString(): String {
    return value
  }
}