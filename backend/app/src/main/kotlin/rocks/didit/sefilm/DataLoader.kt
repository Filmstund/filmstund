package rocks.didit.sefilm

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import org.jdbi.v3.core.Jdbi
import org.jdbi.v3.core.kotlin.inTransactionUnchecked
import org.springframework.core.io.ClassPathResource
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder
import org.springframework.stereotype.Component
import rocks.didit.sefilm.database.dao.LocationDao
import rocks.didit.sefilm.domain.dto.core.LocationDTO
import rocks.didit.sefilm.services.external.FilmstadenService
import java.math.BigDecimal

@Component
class DataLoader(
  private val jdbi: Jdbi,
  private val filmstadenService: FilmstadenService,
  private val properties: Properties
) {
  private val log by logger()

  fun seedInitialData() {
    val objectMapper: ObjectMapper = Jackson2ObjectMapperBuilder.json().build()

    seedLocations(objectMapper)
    seedLocationsFromFilmstaden(objectMapper)
  }

  private fun seedLocations(objectMapper: ObjectMapper) {
    val locationsResource = ClassPathResource("seeds/locations.json")
    val locations: List<LocationDTO> = objectMapper.readValue(locationsResource.inputStream)

    val savedLocs = storeLocations(locations)
    log.info("Seeded locations with $savedLocs new values")
  }

  private fun storeLocations(locations: List<LocationDTO>): Int {
    return jdbi.inTransactionUnchecked { handle ->
      val dao = handle.attach(LocationDao::class.java)

      val newLocs = locations.filterNot { dao.existsByName(it.name) }
      dao.insertLocations(newLocs)
      newLocs.forEach {
        dao.insertAlias(it.name, it.alias)
      }
      newLocs.size
    }
  }

  private fun seedLocationsFromFilmstaden(objectMapper: ObjectMapper) {
    val locationNameAliasResource = ClassPathResource("seeds/filmstaden-location-aliases.json")
    val locationNameAlias: List<LocationAliasDTO> = objectMapper.readValue(locationNameAliasResource.inputStream)

    val defaultCity = properties.defaultCity
    val locationsFromFilmstaden = filmstadenService.getLocationsInCity(properties.defaultCity)
      .map {
        LocationDTO(
          name = it.title,
          cityAlias = it.address.city["alias"],
          city = it.address.city["name"],
          streetAddress = it.address.streetAddress,
          postalCode = it.address.postalCode,
          postalAddress = it.address.postalAddress,
          latitude = BigDecimal(it.address.coordinates.latitude),
          longitude = BigDecimal(it.address.coordinates.longitude),
          filmstadenId = it.ncgId,
          alias = locationNameAlias
            .firstOrNull { alias -> alias.filmstadenId == it.ncgId }?.alias
            ?: listOf()
        )
      }

    val savedRows = storeLocations(locationsFromFilmstaden)
    log.info("Seeded $savedRows new locations from Filmstaden for city: $defaultCity")
  }

  private data class LocationAliasDTO(val filmstadenId: String, val alias: List<String>)
}