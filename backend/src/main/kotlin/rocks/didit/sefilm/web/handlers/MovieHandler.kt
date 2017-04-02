package rocks.didit.sefilm.web.handlers

import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.client.bodyToMono
import org.springframework.web.reactive.function.server.ServerRequest
import org.springframework.web.reactive.function.server.ServerResponse
import org.springframework.web.reactive.function.server.ServerResponse.*
import org.springframework.web.reactive.function.server.body
import reactor.core.publisher.Mono
import reactor.core.publisher.toMono
import rocks.didit.sefilm.database.entities.Movie
import rocks.didit.sefilm.database.repositories.MovieRepository
import rocks.didit.sefilm.domain.*
import rocks.didit.sefilm.json
import rocks.didit.sefilm.uuidMonoPathVariable
import java.net.URI
import java.time.Duration
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.*

@Component
class MovieHandler(private val repo: MovieRepository) {
    private val log = LoggerFactory.getLogger(MovieHandler::class.java)
    private val sfWebClient = WebClient.create(SF_API_URL)
    private val omdbApiWebClient = WebClient.create("http://www.omdbapi.com/")

    fun findAll(req: ServerRequest) = ok().json().body(repo.findAll())

    fun findOne(req: ServerRequest): Mono<ServerResponse> {
        return repo.findOne(req.uuidMonoPathVariable("id"))
                .doOnSuccess { movie ->
                    if (movie == null) return@doOnSuccess
                    when {
                        movie.needsMoreInfo() -> fetchExtendedInfoForMovie(movie)
                        movie.isMissingImdbId() -> fetchImdbIdBasedOnTitleAndYear(movie)
                    }
                }
                .then { m -> ok().json().body(Mono.just(m)) }
                .otherwiseIfEmpty(whatNotFound("Movie"))
                .otherwise(IllegalArgumentException::class.java, { e ->
                    e.localizedMessage.toErrorResponse(HttpStatus.BAD_REQUEST)
                })
                .subscribe()
    }

    fun saveMovie(req: ServerRequest): Mono<ServerResponse> {
        val fetchedMovie = req.bodyToMono(ExternalMovieIdDTO::class.java)
                .then { (imdb, sf) ->
                    fetchInfoFromSf(sf)
                            .otherwise { fetchOmdbExtendedInfo("/?i={id}", mapOf("id" to imdb)) }
                }

        // FIXME: check for existence first
        return repo.save(fetchedMovie)
                .doOnComplete { log.info("Saved incoming movie") }
                .doOnError { e -> log.error("Unable to save incoming movie", e) }
                .flatMap { m -> created(m.toLocationUri()).json().body(m.toMono()) }
                .next()
    }

    fun populateFromSf(req: ServerRequest): Mono<ServerResponse> {
        repo.deleteAll()
                .doOnSuccess { log.warn("Deleted all movies!") }
                .doOnError { e -> log.error("Unable to delete all movies", e) }
                .subscribe()

        val movies = sfWebClient.get()
                .uri("/v1/movies/category/All?Page=1&PageSize=1024&blockId=1592&CityAlias=GB&")
                .accept(MediaType.APPLICATION_JSON_UTF8)
                .exchange()
                .retry(1)
                .doOnError { e -> log.error("Unable to fetch movies from SF. Exception", e) }
                .flatMap { r -> r.bodyToFlux(SfMovieDTO::class.java) }
                .map { (ncgId, title, releaseDate, _, posterUrl) ->
                    Movie(title = title, sfId = ncgId, releaseDate = releaseDate, poster = posterUrl)
                }
        repo.save(movies)
                .doOnError { e -> log.error("Unable to save movies", e) }
                .doOnComplete { log.info("Saved ${movies.count().block()} movies from SF") }
                .subscribe()

        return temporaryRedirect(URI.create("/api/movies")).json().build()
    }

    fun findSfDates(req: ServerRequest): Mono<ServerResponse> {
        return repo.findOne(req.uuidMonoPathVariable("id"))
                .then { (id, _, sfId) ->
                    when (sfId) {
                        null -> Mono.error(IllegalArgumentException("Movie [id=$id] does not have a SF id"))
                        else -> getDatesAndLocationsFromSf(sfId)
                    }
                }
                .then { (_, dates) ->
                    ok().json().body(dates.toMono())
                }
                .otherwiseIfEmpty(whatNotFound("Movie"))
                .otherwise { e ->
                    e.localizedMessage.toErrorResponse(HttpStatus.UNPROCESSABLE_ENTITY)
                }
    }

    fun findSfTimes(req: ServerRequest) = "Not implemented yet".toErrorResponse(HttpStatus.UNPROCESSABLE_ENTITY)

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
                .doOnError { e -> log.error("Unable to fetch movie info from SF for ${movie.sfId}", e) }
                .then { r -> r.bodyToMono(SfExtendedMovieDTO::class) }
                .map {
                    movie.copy(synopsis = it.shortDescription,
                            originalTitle = it.originalTitle,
                            releaseDate = it.releaseDate,
                            productionYear = it.productionYear,
                            runtime = Duration.ofMinutes(it.length),
                            poster = it.posterUrl,
                            genres = it.genres.map { (name) -> name })
                }

        repo.save(updatedMovie)
                .doOnComplete { log.info("Successfully updated and saved movie[${movie.id}] with SF data") }
                .doOnError { e -> log.error("Unable to fetch/update movie[id: ${movie.id}] from SF", e) }
                .subscribe()
    }

    private fun fetchFromImdbById(movie: Movie) {
        log.info("Fetching extended movie info from IMDb by ID for ${movie.imdbId}")
        val updatedInfo = fetchOmdbExtendedInfo("/?i={id}", mapOf("id" to movie.imdbId))
                .map { (_, _, _, _, synopsis, _, _, productionYear, _, poster, genres) ->
                    movie.copy(synopsis = synopsis, productionYear = productionYear, poster = poster, genres = genres)
                }

        repo.save(updatedInfo)
                .doOnError { e -> log.error("Unable to update movie[id=${movie.id}] with new extended info", e) }
                .doOnComplete { log.info("Successfully updated movie with extended information") }
                .subscribe()
    }

    private fun fetchFromImdbByTitle(movie: Movie) {
        log.info("Fetching extended movie info from IMDb by title for ${movie.title} - NOT SUPPORTED YET")
    }

    private fun fetchImdbIdBasedOnTitleAndYear(movie: Movie) {
        val title = movie.originalTitle ?: movie.title

        log.info("Fetching IMDb id for '$title'")
        val updatedInfo = fetchOmdbExtendedInfo("/?t={title}&y={year}",
                mapOf("title" to title, "year" to movie.productionYear))
                .map { (_, imdbId) ->
                    log.info("Updating Imdb id to $imdbId for movie[id=${movie.id}]")
                    movie.copy(imdbId = imdbId)
                }

        repo.save(updatedInfo)
                .doOnError { e -> log.error("Unable to update movie[id=${movie.id}] with new IMDb id", e) }
                .doOnComplete { log.info("Successfully updated movie with new IMDb id") }
    }

    private fun fetchOmdbExtendedInfo(uri: String, params: Map<String, Any?>) =
            omdbApiWebClient.get()
                    .uri(uri, params)
                    .accept(MediaType.APPLICATION_JSON_UTF8)
                    .exchange()
                    .doOnError { e -> log.error("Unable to fetch info from OMDbApi[$params]: $e") }
                    .then { b ->
                        b.bodyToMono(OmdbApiMovieDTO::class)
                    }
                    .map { it.toMovie() }

    private fun fetchInfoFromSf(sfId: String?): Mono<Movie> {
        return when (sfId) {
            null -> Mono.error(NullPointerException("SfId mustn't be null"))
            else -> sfWebClient.get()
                    .uri("/v1/movies/{sfId}", sfId)
                    .accept(MediaType.APPLICATION_JSON_UTF8)
                    .exchange()
                    .retry(1)
                    .doOnError { e -> log.error("Unable to fetch movie info from SF for $sfId", e) }
                    .then { resp ->
                        resp.bodyToMono(SfExtendedMovieDTO::class)
                    }
                    .map { it.toMovie() }
        }
    }

    data class ExternalMovieIdDTO(val imdb: String? = null,
                                  val sf: String? = null)

    private fun OmdbApiMovieDTO.toMovie(): Movie {
        if (!this.Response.toBoolean()) throw IllegalArgumentException("Movie not found on OMDbApi")

        val parsedRuntime = this.Runtime?.substringBefore(" ")?.toLong()
        val runtime = when (parsedRuntime) {
            null -> Duration.ZERO
            else -> Duration.ofMinutes(parsedRuntime)
        }

        val genres = when (this.Genre) {
            null -> listOf()
            else -> this.Genre.split(", ")
        }

        val releaseDate = when (this.Released) {
            null -> LocalDate.now()
            else -> LocalDate.parse(this.Released, DateTimeFormatter.ofPattern("dd MMM yyyy", Locale.US))
        }

        return Movie(imdbId = this.imdbID,
                title = this.Title ?: "",
                synopsis = this.Plot,
                productionYear = this.Year?.toInt(),
                poster = this.Poster,
                runtime = runtime,
                genres = genres,
                releaseDate = releaseDate)
    }

    private fun SfExtendedMovieDTO.toMovie() =
            Movie(sfId = this.ncgId,
                    title = this.title,
                    poster = this.posterUrl,
                    releaseDate = this.releaseDate,
                    originalTitle = this.originalTitle,
                    genres = this.genres.map { (name) -> name },
                    runtime = Duration.ofMinutes(this.length),
                    productionYear = this.productionYear,
                    synopsis = this.shortDescription)

    private fun Movie.toLocationUri() = URI.create("/api/movies/${this.id}")
}
