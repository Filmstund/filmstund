package rocks.didit.sefilm.domain

import com.fasterxml.jackson.annotation.JsonValue

data class PhoneNumber(var number: String = "") {
    init {
        this.number = number
                .replace(" ", "")
                .replace("-", "")
    }

    @JsonValue
    override fun toString(): String {
        return number
    }
}