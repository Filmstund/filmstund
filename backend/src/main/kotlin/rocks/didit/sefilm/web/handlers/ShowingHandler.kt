package rocks.didit.sefilm.web.handlers

import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.BodyInserters
import org.springframework.web.reactive.function.server.ServerRequest
import org.springframework.web.reactive.function.server.ServerResponse
import org.springframework.web.reactive.function.server.ServerResponse.*
import org.springframework.web.reactive.function.server.body
import reactor.core.publisher.Mono
import reactor.core.publisher.toMono
import rocks.didit.sefilm.database.entities.Location
import rocks.didit.sefilm.database.entities.Showing
import rocks.didit.sefilm.database.entities.User
import rocks.didit.sefilm.database.repositories.LocationRepository
import rocks.didit.sefilm.database.repositories.ShowingRepository
import rocks.didit.sefilm.domain.Bioklubbnummer
import rocks.didit.sefilm.json
import rocks.didit.sefilm.uuidMonoPathVariable
import java.net.URI
import java.time.LocalDate
import java.time.LocalTime
import java.util.*

@Component
class ShowingHandler(val repo: ShowingRepository, val locationRepo: LocationRepository) {
    private val log = LoggerFactory.getLogger(MovieHandler::class.java)

    fun findAll(req: ServerRequest) = ok().json().body(repo.findAll())

    fun findOne(req: ServerRequest) = repo.findOne(req.uuidMonoPathVariable("id"))
            .then { s -> ok().json().body(Mono.just(s)) }
            .otherwiseIfEmpty(notFound().build())
            .otherwise(IllegalArgumentException::class.java, { badRequest().build() })

    fun findBioklubbnummerForShowing(req: ServerRequest) =
            repo.findOne(req.uuidMonoPathVariable("id"))
                    .then { s ->
                        ok().json().body(BodyInserters.fromObject(shuffledBioklubbnummer(s.participants)))
                    }
                    .otherwiseIfEmpty(notFound().build())
                    .otherwise(IllegalArgumentException::class.java, { badRequest().build() })

    fun saveShowing(req: ServerRequest): Mono<ServerResponse> {
        val showing = req.bodyToMono(ShowingDTO::class.java)
                .then { s -> s.toShowingMono() }

        return repo.save(showing)
                .doOnComplete { log.info("Saved new showing") }
                .doOnError { e -> log.error("Unable to save new showing", e) }
                .flatMap { s -> created(URI.create("/api/showings/${s.id}")).body(s.toMono()) }
                .next()
    }

    private fun shuffledBioklubbnummer(participants: Collection<User>): List<Bioklubbnummer> {
        val numbers = participants.map(User::bioklubbnummer).filterNotNull()
        Collections.shuffle(numbers)
        return numbers
    }

    data class ShowingDTO(val date: LocalDate,
                          val time: LocalTime,
                          val movieId: UUID,
                          val location: String)

    /* Fetch location from db or create it if it does not exist before converting the showing */
    private fun ShowingDTO.toShowingMono(): Mono<Showing> {
        return locationRepo.findOne(this.location)
                .otherwiseIfEmpty(locationRepo.save(Location(name = this.location)))
                .map { l ->
                    Showing(date = this.date,
                            time = this.time,
                            movieId = this.movieId,
                            location = l)
                }
    }
}