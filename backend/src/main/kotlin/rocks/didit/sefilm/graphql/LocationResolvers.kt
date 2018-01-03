package rocks.didit.sefilm.graphql

import com.coxautodev.graphql.tools.GraphQLQueryResolver
import org.springframework.stereotype.Component
import rocks.didit.sefilm.services.LocationService

@Component
class LocationResolver(private val locationService: LocationService) : GraphQLQueryResolver {
  fun previousLocations() = locationService.allLocations()
  fun location(id: String) = locationService.getLocation(id)
}
