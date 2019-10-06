package rocks.didit.sefilm.database.entities

import org.springframework.data.annotation.LastModifiedDate
import rocks.didit.sefilm.domain.dto.core.LocationDTO
import java.math.BigDecimal
import java.time.Instant
import javax.persistence.CascadeType
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.Id
import javax.persistence.JoinColumn
import javax.persistence.OneToMany
import javax.persistence.Table

@Entity
@Table
data class Location(
  @Id
  @Column(unique = true, nullable = false)
  val name: String = "",

  /** This is the city alias that Filmstaden uses. GB is the alias for Göteborg e.g. */
  @Column(nullable = true)
  val cityAlias: String? = null,

  @Column(nullable = true)
  val city: String? = null,

  @Column(nullable = true)
  val streetAddress: String? = null,

  @Column(nullable = true)
  val postalCode: String? = null,

  @Column(nullable = true)
  val postalAddress: String? = null,

  @Column(nullable = true)
  val latitude: BigDecimal? = null,

  @Column(nullable = true)
  val longitude: BigDecimal? = null,

  @Column(nullable = true, unique = true)
  val filmstadenId: String? = null,

  @OneToMany(cascade = [CascadeType.ALL], orphanRemoval = true)
  @JoinColumn(name = "location")
  val alias: List<LocationAlias> = mutableListOf(),

  @Column(nullable = false)
  @LastModifiedDate
  val lastModifiedDate: Instant = Instant.now()
) {

  val isFilmstadenLocation: Boolean
    get() = filmstadenId != null

  fun hasAlias(other: String) = alias
    .map { it.alias }
    .contains(other)


  fun toDTO() = LocationDTO(
    name = name,
    cityAlias = cityAlias,
    city = city,
    streetAddress = streetAddress,
    postalCode = postalCode,
    postalAddress = postalAddress,
    latitude = latitude,
    longitude = longitude,
    filmstadenId = filmstadenId,
    alias = alias.map { it.alias }
  )
}
