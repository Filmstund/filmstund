package rocks.didit.sefilm.domain.dto.core

import java.math.BigDecimal
import java.time.Instant

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
  val alias: List<String> = listOf(),
  val lastModifiedDate: Instant = Instant.EPOCH
) {
  constructor(
    name: String,
    cityAlias: String?,
    city: String?,
    streetAddress: String?,
    postalCode: String?,
    postalAddress: String?,
    latitude: BigDecimal?,
    longitude: BigDecimal?,
    filmstadenId: String?,
    lastModifiedDate: Instant
  ) : this(
    name,
    cityAlias,
    city,
    streetAddress,
    postalCode,
    postalAddress,
    latitude,
    longitude,
    filmstadenId,
    listOf(),
    lastModifiedDate
  )

  fun formatAddress(): String {
    return if (streetAddress != null) {
      "$name, $streetAddress"
    } else {
      name
    }
  }
}

