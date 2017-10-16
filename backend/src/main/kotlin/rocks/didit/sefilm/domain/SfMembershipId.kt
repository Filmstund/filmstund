package rocks.didit.sefilm.domain

import com.fasterxml.jackson.annotation.JsonValue

data class SfMembershipId(val value: String) { // TODO: add isGold()
  companion object {
    fun valueOf(profileId: String): SfMembershipId {
      if (profileId[3] == '-' && profileId.length == 7) {
        return SfMembershipId(profileId)
      }
      if (profileId.length != 6) {
        throw IllegalArgumentException("$profileId does not look like a valid profileId as supplied by SF")
      }

      return SfMembershipId("${profileId.substring(0, 3)}-${profileId.substring(3, profileId.length)}")
    }
  }

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