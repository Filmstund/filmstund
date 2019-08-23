package rocks.didit.sefilm.domain

import com.fasterxml.jackson.annotation.JsonValue

data class FilmstadenMembershipId(val value: String) {
    companion object {
        fun valueOf(profileId: String): FilmstadenMembershipId {
            if (profileId[3] == '-' && profileId.length == 7) {
                return FilmstadenMembershipId(profileId.toUpperCase())
            }
            require(profileId.length == 6) { "$profileId does not look like a valid profileId as supplied by Filmstaden" }
            val split = profileId.split('-', limit = 2)
            require(!(split.size == 2 && (split[0].length != 3 || split[1].length != 3))) { "'$profileId' is an invalid membership id. Expected XXX-XXX" }

            return FilmstadenMembershipId("${profileId.substring(0, 3)}-${profileId.substring(3, profileId.length)}".toUpperCase())
        }
    }

    init {
        if (value.length < 6 || value.length > 7) {
            throw IllegalArgumentException("The Filmstaden membership id has wrong size. Expected 6-7, got ${value.length}")
        }
    }

    @JsonValue
    override fun toString(): String {
        return value
    }
}