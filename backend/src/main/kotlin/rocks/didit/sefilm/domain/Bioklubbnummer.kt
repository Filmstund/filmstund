package rocks.didit.sefilm.domain

import java.io.Serializable

data class Bioklubbnummer(val value: String): Serializable {
    init {
        if (value.length != 11) {
            throw IllegalArgumentException("Bioklubbnummer has wrong size. Expected 11, got ${value.length}")
        }
        if (value.toLongOrNull() == null) {
            throw IllegalArgumentException("'$value' is an invalid bioklubbnummer")
        }
    }
}