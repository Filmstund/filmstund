package rocks.didit.sefilm.web.handlers

import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.server.ServerRequest
import org.springframework.web.reactive.function.server.ServerResponse.notFound
import org.springframework.web.reactive.function.server.ServerResponse.ok
import org.springframework.web.reactive.function.server.body
import reactor.core.publisher.Mono
import rocks.didit.sefilm.database.repositories.MovieRepository
import rocks.didit.sefilm.json

@Component
class MovieHandler(private val repo: MovieRepository) {
    fun findAll(req: ServerRequest) = ok().json().body(repo.findAll())
    fun findOne(req: ServerRequest) = repo.findOne(req.pathVariable("id"))
            .then { m -> ok().json().body(Mono.just(m)) }
            .otherwiseIfEmpty(notFound().build())
}