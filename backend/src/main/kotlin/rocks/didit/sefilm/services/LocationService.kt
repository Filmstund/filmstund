package rocks.didit.sefilm.services

import org.springframework.stereotype.Component
import rocks.didit.sefilm.database.entities.Location
import rocks.didit.sefilm.database.repositories.LocationRepository
import java.util.*

@Component
class LocationService(private val locationRepo: LocationRepository) {
  fun allLocations() = locationRepo.findAll().toList()
  fun getLocation(id: String): Optional<Location> = locationRepo.findById(id)
}