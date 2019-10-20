@file:Suppress("unused")

package se.filmstund.graphql

import com.coxautodev.graphql.tools.GraphQLQueryResolver
import org.springframework.stereotype.Component
import se.filmstund.services.LocationService

@Component
class LocationResolver(private val locationService: LocationService) : GraphQLQueryResolver {
  fun previousLocations() = locationService.allLocations()
  fun location(id: String) = locationService.getLocation(id)
  fun filmstadenCities() = locationService.filmstadenCities()
}
