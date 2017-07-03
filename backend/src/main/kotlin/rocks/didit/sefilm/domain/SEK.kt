package rocks.didit.sefilm.domain

import com.fasterxml.jackson.annotation.JsonValue

/** Swedish Crowns, represented by ören */
data class SEK(val ören: Long) {
  init {
    if (ören < 0) {
      throw IllegalArgumentException("You cannot have negative money")
    }
  }

  /** Rounds to nearest integer */
  fun toKronor(): Long = ören / 100

  @JsonValue
  fun toÖren(): Long = ören
}