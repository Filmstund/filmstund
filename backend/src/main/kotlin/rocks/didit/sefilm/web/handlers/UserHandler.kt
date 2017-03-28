package rocks.didit.sefilm.web.handlers

import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.server.ServerRequest
import org.springframework.web.reactive.function.server.ServerResponse.notFound
import org.springframework.web.reactive.function.server.ServerResponse.ok
import org.springframework.web.reactive.function.server.body
import reactor.core.publisher.Mono
import rocks.didit.sefilm.database.repositories.UserRepository
import rocks.didit.sefilm.json

@Component
class UserHandler(val userRepository: UserRepository) {
    fun findAll(req: ServerRequest) = ok().json().body(userRepository.findAll())
    fun findOne(req: ServerRequest) = userRepository.findOne(req.pathVariable("id"))
            .then { u -> ok().json().body(Mono.just(u)) }
            .otherwiseIfEmpty(notFound().build())
}

