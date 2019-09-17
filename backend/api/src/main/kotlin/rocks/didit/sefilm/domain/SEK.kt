package rocks.didit.sefilm.domain

import com.fasterxml.jackson.annotation.JsonValue

/** Swedish Crowns, represented by ören */
data class SEK(val ören: Long) {
  companion object {
    val ZERO = SEK(0)
  }

  init {
    require(ören >= 0) { "You cannot have negative money" }
  }

  /** Rounds to nearest integer */
  fun toKronor(): Long = ören / 100

  @JsonValue
  fun toÖren(): Long = ören
}