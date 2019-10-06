package rocks.didit.sefilm.services

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import org.springframework.core.io.ClassPathResource
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder
import org.springframework.stereotype.Service
import rocks.didit.sefilm.database.entities.Location
import rocks.didit.sefilm.database.repositories.LocationRepository
import rocks.didit.sefilm.domain.dto.FilmstadenCityAliasDTO
import rocks.didit.sefilm.domain.dto.core.LocationDTO

@Service
class LocationService(private val locationRepo: LocationRepository) {
  fun allLocations() = locationRepo.findAll().toList().map { it.toDTO() }
  fun getLocation(name: String): LocationDTO? =
    locationRepo.findByNameIgnoreCaseOrAlias_AliasIgnoreCase(name, name)?.toDTO()

  fun filmstadenCities(): List<FilmstadenCityAliasDTO> {
    val objectMapper: ObjectMapper = Jackson2ObjectMapperBuilder.json().build()

    val cityResource = ClassPathResource("seeds/filmstaden-cities.json")
    return objectMapper.readValue(cityResource.inputStream)
  }

  fun getOrCreateNewLocation(name: String): Location {
    return locationRepo
      .findByNameIgnoreCaseOrAlias_AliasIgnoreCase(name, name)
      ?: locationRepo.save(Location(name = name))
  }
}