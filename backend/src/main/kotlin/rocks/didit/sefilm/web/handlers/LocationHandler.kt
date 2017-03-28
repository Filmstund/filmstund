package rocks.didit.sefilm.web.handlers

import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.server.ServerRequest
import org.springframework.web.reactive.function.server.ServerResponse.ok
import org.springframework.web.reactive.function.server.body
import rocks.didit.sefilm.database.repositories.LocationRepository
import rocks.didit.sefilm.json

@Component
class LocationHandler(private val repo: LocationRepository) {
    fun findAll(req: ServerRequest) = ok().json().body(repo.findAll())
    fun findOne(req: ServerRequest) = ok().json().body(repo.findOne(req.pathVariable("name")))
}