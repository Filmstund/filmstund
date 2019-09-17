package rocks.didit.sefilm.domain.dto

import java.math.BigDecimal

data class LocationDTO(
  val name: String,
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
  fun formatAddress(): String {
    return if (streetAddress != null) {
      "$name, $streetAddress"
    } else {
      name
    }
  }
}

