package se.filmstund.services

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import org.jdbi.v3.core.Jdbi
import org.jdbi.v3.core.kotlin.inTransactionUnchecked
import org.springframework.core.io.ClassPathResource
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder
import org.springframework.stereotype.Service
import se.filmstund.database.dao.LocationDao
import se.filmstund.domain.dto.FilmstadenCityAliasDTO
import se.filmstund.domain.dto.core.LocationDTO

@Service
class LocationService(private val jdbi: Jdbi, private val onDemandLocationDao: LocationDao) {
  fun allLocations() = onDemandLocationDao.findAll()
  fun getLocation(name: String): LocationDTO? = onDemandLocationDao.findByNameOrAlias(name)

  fun filmstadenCities(): List<FilmstadenCityAliasDTO> {
    val objectMapper: ObjectMapper = Jackson2ObjectMapperBuilder.json().build()

    val cityResource = ClassPathResource("seeds/filmstaden-cities.json")
    return objectMapper.readValue(cityResource.inputStream)
  }

  fun getOrCreateNewLocation(name: String): LocationDTO {
    return jdbi.inTransactionUnchecked { h ->
      val locationDao = h.attach(LocationDao::class.java)
      locationDao.findByNameOrAlias(name)
        ?: h.createQuery("INSERT INTO location (name) VALUES (:name) RETURNING *")
          .bind("name", name)
          .mapTo(LocationDTO::class.java)
          .one()
    }
  }
}