package rocks.didit.sefilm.domain

import com.fasterxml.jackson.annotation.JsonValue

data class SfMembershipId(val value: String) {
  companion object {
    fun valueOf(profileId: String): SfMembershipId {
      if (profileId[3] == '-' && profileId.length == 7) {
        return SfMembershipId(profileId)
      }
      if (profileId.length != 6) {
        throw IllegalArgumentException("$profileId does not look like a valid profileId as supplied by SF")
      }
      val split = profileId.split('-', limit = 2)
      if (split.size == 2 && (split[0].length != 3 || split[1].length != 3)) {
        throw IllegalArgumentException("'$profileId' is an invalid membership id. Expected XXX-XXX")
      }

      return SfMembershipId("${profileId.substring(0, 3)}-${profileId.substring(3, profileId.length)}")
    }
  }

  init {
    if (value.length < 6 || value.length > 7) {
      throw IllegalArgumentException("The SF membership id has wrong size. Expected 6-7, got ${value.length}")
    }
  }

  @JsonValue
  override fun toString(): String {
    return value
  }
}