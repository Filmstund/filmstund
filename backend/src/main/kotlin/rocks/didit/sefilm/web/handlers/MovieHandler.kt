package rocks.didit.sefilm.web.handlers

import org.slf4j.LoggerFactory
import org.springframework.http.MediaType
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.server.ServerRequest
import org.springframework.web.reactive.function.server.ServerResponse
import org.springframework.web.reactive.function.server.ServerResponse.*
import org.springframework.web.reactive.function.server.body
import reactor.core.publisher.Mono
import rocks.didit.sefilm.database.entities.Movie
import rocks.didit.sefilm.database.repositories.MovieRepository
import rocks.didit.sefilm.json
import rocks.didit.sefilm.uuidMonoPathVariable
import java.time.LocalDate

@Component
class MovieHandler(private val repo: MovieRepository) {
    private val log = LoggerFactory.getLogger(MovieHandler::class.java)

    fun findAll(req: ServerRequest) = ok().json().body(repo.findAll())
    fun findOne(req: ServerRequest) = repo.findOne(req.uuidMonoPathVariable("id"))
            .then { m -> ok().json().body(Mono.just(m)) }
            .otherwiseIfEmpty(notFound().build())

    fun populateFromSf(req: ServerRequest): Mono<ServerResponse> {
        repo.deleteAll()
                .doOnSuccess { log.warn("Deleted all movies!") }
                .doOnError { log.error("Unable to delete all movies") }
                .subscribe()

        val client = WebClient.create("https://beta.sfbio.se/api")
        val movies = client.get()
                .uri("/v1/movies/category/All?Page=1&PageSize=1024&blockId=1592&CityAlias=GB&")
                .accept(MediaType.APPLICATION_JSON_UTF8)
                .exchange()
                .doOnError { e -> log.error("Unable to fetch movies from SF. Exception: $e") }
                .flatMap { r -> r.bodyToFlux(SfMovieDTO::class.java) }
                .map { (ncgId, title, releaseDate, _, posterUrl) ->
                    Movie(title = title, sfId = ncgId, releaseDate = releaseDate, poster = posterUrl)
                }
        repo.save(movies)
                .doOnError { e -> log.error("Unable to save movies: $e") }
                .doOnComplete { log.info("Saved ${movies.count()} movies from SF") }
                .subscribe()

        return noContent().build()
    }

    data class SfRatingDTO(val age: Int,
                           val ageAccompanied: Int,
                           val alias: String,
                           val displayName: String)

    data class SfMovieDTO(val ncgId: String,
                          val title: String,
                          val releaseDate: LocalDate,
                          val rating: SfRatingDTO,
                          val posterUrl: String,
                          val badge: String,
                          val isNew: Boolean,
                          val isUpcoming: Boolean,
                          val slug: String)
}