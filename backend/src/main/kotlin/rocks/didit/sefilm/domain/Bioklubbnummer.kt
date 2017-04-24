package rocks.didit.sefilm.domain

import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonValue
import java.io.Serializable

data class Bioklubbnummer @JsonCreator constructor(val value: String): Serializable { // TODO: add isGold()
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