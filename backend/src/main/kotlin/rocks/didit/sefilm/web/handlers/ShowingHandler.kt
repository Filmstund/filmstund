package rocks.didit.sefilm.web.handlers

import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.BodyInserters
import org.springframework.web.reactive.function.server.ServerRequest
import org.springframework.web.reactive.function.server.ServerResponse.ok
import org.springframework.web.reactive.function.server.body
import rocks.didit.sefilm.database.entities.User
import rocks.didit.sefilm.database.repositories.ShowingRepository
import rocks.didit.sefilm.domain.Bioklubbnummer
import rocks.didit.sefilm.json
import java.util.*

@Component
class ShowingHandler(val repo: ShowingRepository) {
    fun findAll(req: ServerRequest) = ok().json().body(repo.findAll())
    fun findOne(req: ServerRequest) = ok().json().body(repo.findOne(UUID.fromString(req.pathVariable("id"))))
    fun findBioklubbnummerForShowing(req: ServerRequest) = repo.findOne(UUID.fromString(req.pathVariable("id")))
            .then { s ->
                ok().json().body(BodyInserters.fromObject(shuffledBioklubbnummer(s.participants)))
            }

    private fun shuffledBioklubbnummer(participants: Collection<User>): List<Bioklubbnummer> {
        val numbers = participants.map(User::bioklubbnummer).filterNotNull()
        Collections.shuffle(numbers)
        return numbers
    }
}