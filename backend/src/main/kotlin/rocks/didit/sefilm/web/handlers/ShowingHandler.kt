package rocks.didit.sefilm.web.handlers

import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.server.ServerRequest
import org.springframework.web.reactive.function.server.ServerResponse.ok
import org.springframework.web.reactive.function.server.body
import rocks.didit.sefilm.database.repositories.ShowingRepository
import rocks.didit.sefilm.json
import java.util.*

@Component
class ShowingHandler(val repo: ShowingRepository) {
    fun findAll(req: ServerRequest) = ok().json().body(repo.findAll())
    fun findOne(req: ServerRequest) = ok().json().body(repo.findOne(UUID.fromString(req.pathVariable("id"))))
    //fun findBioklubbnummerForShowing(id: UUID) = showingRepository.findBioklubbnummerForShowing(id)
}