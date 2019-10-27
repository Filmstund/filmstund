package se.filmstund.domain

import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonValue

/** Swedish Crowns, represented by ören */
@Suppress("NonAsciiCharacters")
data class SEK(val ören: Long) {
  companion object {
    val ZERO = SEK(0)

    @JvmStatic
    @JsonCreator
    fun from(ören: Long?) = ören?.let { SEK(it) }
  }

  init {
    require(ören >= 0) { "You cannot have negative money" }
  }

  /** Rounds to nearest integer */
  fun toKronor(): Long = ören / 100

  @JsonValue
  fun toÖren(): Long = ören
}