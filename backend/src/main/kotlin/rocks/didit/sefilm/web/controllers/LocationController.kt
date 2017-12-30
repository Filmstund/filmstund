package rocks.didit.sefilm.web.controllers

import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RestController
import rocks.didit.sefilm.Application
import rocks.didit.sefilm.NotFoundException
import rocks.didit.sefilm.database.entities.Location
import rocks.didit.sefilm.database.repositories.LocationRepository

@RestController
class LocationController(private val repo: LocationRepository) {
  companion object {
    private const val BASE_PATH = Application.API_BASE_PATH + "/locations"
  }

  @GetMapping(BASE_PATH, produces = [(MediaType.APPLICATION_JSON_UTF8_VALUE)])
  fun findAll() = repo.findAll()

  @GetMapping(BASE_PATH + "/{id}", produces = [(MediaType.APPLICATION_JSON_UTF8_VALUE)])
  fun findOne(@PathVariable id: String): Location {
    return repo.findById(id)
      .orElseThrow { NotFoundException("location '$id'") }
  }
}