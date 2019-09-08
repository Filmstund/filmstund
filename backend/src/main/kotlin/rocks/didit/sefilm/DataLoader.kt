package rocks.didit.sefilm

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import org.springframework.core.io.ClassPathResource
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import rocks.didit.sefilm.database.entities.Location
import rocks.didit.sefilm.database.entities.LocationAlias
import rocks.didit.sefilm.database.mongo.repositories.LocationMongoRepository
import rocks.didit.sefilm.database.repositories.LocationRepository
import rocks.didit.sefilm.services.external.FilmstadenService
import java.math.BigDecimal

@Component
class DataLoader(
  private val locationRepository: LocationRepository,
  private val locationsMongoRepo: LocationMongoRepository,
  private val filmstadenService: FilmstadenService,
  private val properties: Properties
) {
  private val log by logger()

  @Transactional
  fun seedInitialData() {
    val objectMapper: ObjectMapper = Jackson2ObjectMapperBuilder.json().build()

    seedLocations(objectMapper)
    seedLocationsFromFilmstaden(objectMapper)
  }

  private fun seedLocations(objectMapper: ObjectMapper) {
    val locationsResource = ClassPathResource("seeds/locations.json")
    val locations: List<Location> = objectMapper.readValue(locationsResource.inputStream)

    locationRepository.saveAll(locations)
    log.info("Seeded locations with ${locations.size} values")
  }

  private fun seedLocationsFromFilmstaden(objectMapper: ObjectMapper) {
    val locationNameAliasResource = ClassPathResource("seeds/filmstaden-location-aliases.json")
    val locationNameAlias: List<LocationAliasDTO> = objectMapper.readValue(locationNameAliasResource.inputStream)

    val defaultCity = properties.defaultCity
    val locationsFromFilmstaden = filmstadenService.getLocationsInCity(properties.defaultCity)
      .map {
        Location(
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
            ?.map { alias -> LocationAlias(alias) }
            ?: listOf()
        )
      }


    val savedRows = locationRepository.saveAll(locationsFromFilmstaden).count()
    log.info("Seeded $savedRows locations from Filmstaden for city: $defaultCity")
  }

  private data class LocationAliasDTO(val filmstadenId: String, val alias: List<String>)
}