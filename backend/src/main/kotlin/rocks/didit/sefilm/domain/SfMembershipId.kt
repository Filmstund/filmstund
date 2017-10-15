package rocks.didit.sefilm.domain

import com.fasterxml.jackson.annotation.JsonValue

data class SfMembershipId(val value: String) { // TODO: add isGold()
  init {
    if (value.length < 6 || value.length > 7) {
      throw IllegalArgumentException("The SF membership id has wrong size. Expected 6-7, got ${value.length}")
    }

    if (!value.matches(Regex("^([0-9a-zA-Z]{3}-[0-9a-zA-Z]{3}|[0-9a-zA-Z]{6})\$"))) {
      throw IllegalArgumentException("'$value' is an invalid membership id. Expected XXX-XXX")
    }
  }

  @JsonValue
  override fun toString(): String {
    return value
  }
}