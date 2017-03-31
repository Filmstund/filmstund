package rocks.didit.sefilm.web.handlers

import org.slf4j.LoggerFactory
import org.springframework.http.MediaType
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.client.bodyToMono
import org.springframework.web.reactive.function.server.ServerRequest
import org.springframework.web.reactive.function.server.ServerResponse
import org.springframework.web.reactive.function.server.ServerResponse.*
import org.springframework.web.reactive.function.server.body
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import reactor.core.publisher.toMono
import rocks.didit.sefilm.Properties
import rocks.didit.sefilm.database.entities.Movie
import rocks.didit.sefilm.database.repositories.MovieRepository
import rocks.didit.sefilm.domain.OmdbApiMovieDTO
import rocks.didit.sefilm.domain.SfExtendedMovieDTO
import rocks.didit.sefilm.domain.SfMovieDTO
import rocks.didit.sefilm.json
import rocks.didit.sefilm.uuidMonoPathVariable
import java.net.URI
import java.time.Duration

@Component
class MovieHandler(private val repo: MovieRepository, private val properties: Properties) {
    private val log = LoggerFactory.getLogger(MovieHandler::class.java)
    private val sfWebClient = WebClient.create("https://beta.sfbio.se/api")
    private val omdbApiWebClient = WebClient.create("http://www.omdbapi.com/")

    fun findAll(req: ServerRequest) = ok().json().body(repo.findAll())
    fun findOne(req: ServerRequest): Mono<ServerResponse> {
        val movie = repo.findOne(req.uuidMonoPathVariable("id"))
                .doOnSuccess { movie ->
                    when {
                        movie.needsMoreInfo() -> fetchExtendedInfoForMovie(movie)
                        movie.isMissingImdbId() -> fetchImdbIdBasedOnTitleAndYear(movie)
                    }
                }.subscribe()

        return movie.then { m -> ok().json().body(Mono.just(m)) }
                .otherwiseIfEmpty(notFound().build())
                .otherwise(IllegalArgumentException::class.java, { badRequest().build() })
    }

    fun populateFromSf(req: ServerRequest): Mono<ServerResponse> {
        repo.deleteAll()
                .doOnSuccess { log.warn("Deleted all movies!") }
                .doOnError { log.error("Unable to delete all movies") }
                .subscribe()

        val movies = sfWebClient.get()
                .uri("/v1/movies/category/All?Page=1&PageSize=1024&blockId=1592&CityAlias=GB&")
                .accept(MediaType.APPLICATION_JSON_UTF8)
                .exchange()
                .retry(1)
                .doOnError { e -> log.error("Unable to fetch movies from SF. Exception: $e") }
                .flatMap { r -> r.bodyToFlux(SfMovieDTO::class.java) }
                .map { (ncgId, title, releaseDate, _, posterUrl) ->
                    Movie(title = title, sfId = ncgId, releaseDate = releaseDate, poster = posterUrl)
                }
        repo.save(movies)
                .doOnError { e -> log.error("Unable to save movies: $e") }
                .doOnComplete { log.info("Saved ${movies.count().block()} movies from SF") }
                .subscribe()

        return temporaryRedirect(URI.create("/api/movies")).build()
    }

    private fun fetchExtendedInfoForMovie(movie: Movie) {
        log.info("Fetching extended movie info for ${movie.id}")
        when {
            movie.sfId != null -> fetchFromSf(movie)
            movie.imdbId != null -> fetchFromImdbById(movie)
            else -> fetchFromImdbByTitle(movie)
        }
    }

    private fun fetchFromSf(movie: Movie) {
        log.info("Fetching extended movie info from SF for ${movie.sfId}")
        val updatedMovie = sfWebClient.get()
                .uri("/v1/movies/{sfId}", mapOf("sfId" to movie.sfId))
                .accept(MediaType.APPLICATION_JSON_UTF8)
                .exchange()
                .retry(1)
                .doOnError { e -> log.error("Unable to fetch movie info from SF for ${movie.sfId}: $e") }
                .flatMap { r -> r.bodyToMono(SfExtendedMovieDTO::class) }
                .flatMap { m ->
                    movie.copy(synopsis = m.shortDescription,
                            originalTitle = m.originalTitle,
                            releaseDate = m.releaseDate,
                            productionYear = m.productionYear,
                            runtime = Duration.ofMinutes(m.length.toLong()),
                            poster = m.posterUrl,
                            genres = m.genres.map { g -> g.name }).toMono()
                }


        repo.save(updatedMovie)
                .doOnComplete { log.info("Successfully updated and saved movie[${movie.id}] with SF data") }
                .doOnError { e -> log.error("Unable to fetch/update movie[id: ${movie.id}] from SF: ${e}") }
                .subscribe()
    }

    private fun fetchFromImdbById(movie: Movie) {
        log.info("Fetching extended movie info from IMDb by ID for ${movie.imdbId}")
        val updatedInfo = fetchOmdbExtendedInfo(movie, "/?i={id}", mapOf("id" to movie.imdbId))
                .flatMap { m ->
                    if (!m.Response.toBoolean()) return@flatMap movie.toMono()

                    val genres: List<String>
                    if (m.Genre != null) {
                        genres = m.Genre.split(", ")
                    } else {
                        genres = listOf()
                    }

                    movie.copy(synopsis = m.Plot, productionYear = m.Year?.toInt(), poster = m.Poster, genres = genres).toMono()
                }

        repo.save(updatedInfo)
                .doOnError { e -> log.error("Unable to update movie[id=${movie.id}] with new extended info: $e") }
                .doOnComplete { log.info("Successfully updated movie with extended information") }
                .subscribe()
    }

    private fun fetchFromImdbByTitle(movie: Movie) {
        log.info("Fetching extended movie info from IMDb by title for ${movie.title} - NOT SUPPORTED YET")
    }

    private fun fetchImdbIdBasedOnTitleAndYear(movie: Movie) {
        val title = movie.originalTitle ?: movie.title

        log.info("Fetching IMDb id for '$title'")
        val updatedInfo = fetchOmdbExtendedInfo(movie, "/?t={title}&y={year}",
                mapOf("title" to title, "year" to movie.productionYear))
                .flatMap { m ->
                    if (!m.Response.toBoolean()) {
                        log.info("Omdb didn't find anything for '$title'")
                        return@flatMap movie.toMono()
                    }
                    log.info("Updating Imdb id to ${m.imdbID} for movie[id=${movie.id}]")
                    movie.copy(imdbId = m.imdbID).toMono()
                }

        repo.save(updatedInfo)
                .doOnError { e -> log.error("Unable to update movie[id=${movie.id}] with new IMDb id: $e") }
                .doOnComplete { log.info("Successfully updated movie with new IMDb id") }
                .subscribe()
    }

    private fun fetchOmdbExtendedInfo(movie: Movie, uri: String, params: Map<String, Any?>): Flux<OmdbApiMovieDTO> {
        return omdbApiWebClient.get()
                .uri(uri, params)
                .accept(MediaType.APPLICATION_JSON_UTF8)
                .exchange()
                .doOnError { e -> log.error("Unable to fetch info from OMDbApi[title='${movie.title}', year=${movie.productionYear}: $e") }
                .flatMap { b -> b.bodyToMono(OmdbApiMovieDTO::class) }
    }
}
