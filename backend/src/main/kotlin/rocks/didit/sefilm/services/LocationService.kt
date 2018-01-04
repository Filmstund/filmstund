package rocks.didit.sefilm.services

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import org.springframework.core.io.ClassPathResource
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder
import org.springframework.stereotype.Component
import rocks.didit.sefilm.database.entities.Location
import rocks.didit.sefilm.database.repositories.LocationRepository
import rocks.didit.sefilm.domain.dto.SfCityAliasDTO
import java.util.*

@Component
class LocationService(private val locationRepo: LocationRepository) {
  fun allLocations() = locationRepo.findAll().toList()
  fun getLocation(id: String): Optional<Location> = locationRepo.findById(id)

  fun sfCities(): List<SfCityAliasDTO> {
    val objectMapper: ObjectMapper = Jackson2ObjectMapperBuilder.json().build()

    val cityResource = ClassPathResource("seeds/sf-cities.json")
    return objectMapper.readValue(cityResource.inputStream)
  }
}