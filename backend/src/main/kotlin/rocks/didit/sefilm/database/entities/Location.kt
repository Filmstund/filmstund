package rocks.didit.sefilm.database.entities

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import java.math.BigDecimal

@Document
data class Location(
        @Id
        val name: String? = null,
        /** This is the city alias that Filmstaden uses. GB is the alias for Göteborg e.g. */
        val cityAlias: String? = null,
        val city: String? = null,
        val streetAddress: String? = null,
        val postalCode: String? = null,
        val postalAddress: String? = null,
        val latitude: BigDecimal? = null,
        val longitude: BigDecimal? = null,
        val filmstadenId: String? = null,
        val alias: List<String> = listOf()
) {

    fun isFilmstadenLocation() = filmstadenId != null

    fun hasAlias(other: String) = alias.contains(other)

    fun formatAddress(): String {
        if (name == null) {
            return ""
        }

        return if (streetAddress != null) {
            "$name, $streetAddress"
        } else {
            name
        }
    }
}
