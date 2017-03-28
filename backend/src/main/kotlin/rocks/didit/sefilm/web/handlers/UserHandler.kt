package rocks.didit.sefilm.web.handlers

import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.server.ServerRequest
import org.springframework.web.reactive.function.server.ServerResponse.ok
import org.springframework.web.reactive.function.server.body
import rocks.didit.sefilm.database.repositories.UserRepository
import rocks.didit.sefilm.json
import java.util.*

@Component
class UserHandler(val userRepository: UserRepository) {
    fun findAll(req: ServerRequest) = ok().json().body(userRepository.findAll())
    fun findOne(req: ServerRequest) = ok().json().body(userRepository.findOne(req.pathVariable("id")))
}

