package rocks.didit.sefilm.domain

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import java.net.URI
import java.net.URLEncoder
import java.nio.charset.StandardCharsets

data class StringValue(
        val value: String,
        val editable: Boolean = false
)

data class IntValue(
        val value: Long,
        val editable: Boolean = false
)

data class SwishDataDTO(
        val version: Int = 1,
        val payee: StringValue,
        val amount: IntValue,
        val message: StringValue) {

    fun generateUri(): URI {
        val asString = jacksonObjectMapper().writeValueAsString(this)
        val encodedData = URLEncoder.encode(asString, StandardCharsets.UTF_8.displayName())
        return URI.create("swish://payment?data=$encodedData")
    }
}
