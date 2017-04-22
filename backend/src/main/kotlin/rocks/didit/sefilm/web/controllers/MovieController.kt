package rocks.didit.sefilm.web.controllers

import org.slf4j.LoggerFactory
import org.springframework.cache.annotation.Cacheable
import org.springframework.core.ParameterizedTypeReference
import org.springframework.http.HttpEntity
import org.springframework.http.HttpMethod
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.client.RestTemplate
import org.springframework.web.util.UriComponentsBuilder
import rocks.didit.sefilm.*
import rocks.didit.sefilm.database.entities.Movie
import rocks.didit.sefilm.database.repositories.MovieRepository
import rocks.didit.sefilm.domain.*
import java.time.Duration
import java.time.LocalDate
import java.time.LocalTime
import java.time.format.DateTimeFormatter
import java.util.*


@RestController
class MovieController(private val repo: MovieRepository,
                      private val restTemplate: RestTemplate,
                      private val sfClient: SfClient,
                      private val httpEntity: HttpEntity<Void>) {
    companion object {
        private const val PATH = Application.API_BASE_PATH + "/movies"
        private const val PATH_WITH_ID = PATH + "/{id}"
        private const val OMDBAPI_URL = "http://www.omdbapi.com/"
    }

    private val log = LoggerFactory.getLogger(MovieController::class.java)

    @GetMapping(PATH, produces = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE))
    fun findAll() = repo.findAll()

    @GetMapping(PATH_WITH_ID, produces = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE))
    fun findOne(@PathVariable id: UUID): Movie {
        val movie = repo.findOne(id).orElseThrow { NotFoundException("movie '$id'") }
        when {
        // FIXME: move this to /scrape or something
            movie.needsMoreInfo() -> fetchExtendedInfoForMovie(movie)
            movie.isMissingImdbId() -> updateImdbIdBasedOnTitleAndYear(movie)
        }
        return movie
    }

    @PostMapping(PATH, consumes = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE), produces = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE))
    fun saveMovie(@RequestBody body: ExternalMovieIdDTO, b: UriComponentsBuilder): ResponseEntity<Void> {
        val movieInfo = when {
            body.sf != null -> fetchInfoFromSf(body.sf)
            body.imdb != null -> fetchOmdbExtendedInfo(OMDBAPI_URL + "/?i={id}", mapOf("id" to body.imdb))
            else -> throw MissingParametersException()
        }

        if (movieInfo == null) {
            log.info("Movie info not found for $body")
            throw ExternalProviderException()
        }

        // FIXME: check if a movie with the supplied sf or imdb id already exists
        val movie = repo.save(movieInfo)
        val createdUri = b.path(PATH_WITH_ID).buildAndExpand(movie.id).toUri()
        return ResponseEntity.created(createdUri).build()
    }

    @GetMapping(PATH + "/sf/populate")
    fun populateFromSf(): SavedEntitiesDTO {
        val sfMovies = restTemplate
                .exchange(SF_API_URL + "/v1/movies/category/All?Page=1&PageSize=1024&blockId=1592&CityAlias=GB&", HttpMethod.GET,
                        httpEntity, object : ParameterizedTypeReference<List<SfMovieDTO>>() {})
                .body

        val ourMovies = repo.findAll()
        val newMoviesWeHaventPreviouslySeen = sfMovies
                .filter { sf -> ourMovies.firstOrNull { our -> our.sfId == sf.ncgId } == null }
                .map { (ncgId, title, releaseDate, _, posterUrl) ->
                    Movie(title = title, sfId = ncgId, releaseDate = releaseDate, poster = posterUrl)
                }

        val savedEntities = repo.save(newMoviesWeHaventPreviouslySeen)
        return SavedEntitiesDTO(savedEntities.count(), "Fetched and saved new movies from SF")
    }

    @GetMapping(PATH_WITH_ID + "/sfdates")
    @Cacheable("sfdates")
    fun findSfDates(@PathVariable id: UUID): Collection<LocalDate> {
        val movie = repo.findOne(id).orElseThrow { NotFoundException("movie '$id") }
        if (movie.sfId == null) throw MissingSfIdException()

        return sfClient.getDatesAndLocations(movie.sfId).dates
    }

    @GetMapping(PATH_WITH_ID + "/sfdates/{date}")
    @Cacheable("sfdate")
    fun findSfTimes(@PathVariable id: UUID, @PathVariable date: String): Collection<ScreenDTO> {
        if (!date.matches(Regex("^\\d{4}-\\d{2}-\\d{2}$"))) throw BadRequestException("Wrong date format, requires yyyy-mm-dd")
        val movie = repo.findOne(id).orElseThrow { NotFoundException("movie '$id'") }
        if (movie.sfId == null) throw MissingSfIdException()

        val screens = sfClient.getScreensForDateAndMovie(movie.sfId, date)
        return screens.entities
                .flatMap { e -> e.shows }
                .map { show ->
                    val tags = show.attributes.map { a -> SfTag.valueOf(a.displayName) }.toMutableList()
                    if (show.screen.screenName.endsWith("VIP")) {
                        tags.add(SfTag.VIP)
                    }

                    ScreenDTO(show.time.toLocalTime(), show.screen.screenName, show.cinemaName, tags)
                }
    }

    private fun fetchExtendedInfoForMovie(movie: Movie) {
        log.info("Fetching extended movie info for ${movie.id}")
        when {
            movie.sfId != null -> updateFromSf(movie)
            movie.imdbId != null -> updateFromImdbById(movie)
            else -> updateFromImdbByTitle(movie)
        }
    }

    private fun updateFromSf(movie: Movie): Movie {
        log.info("Fetching extended movie info from SF for ${movie.sfId}")
        val updatedMovie = restTemplate.exchange(SF_API_URL + "/v1/movies/{sfId}", HttpMethod.GET, httpEntity, SfExtendedMovieDTO::class.java,
                movie.sfId).body

        val copy = movie.copy(synopsis = updatedMovie.shortDescription,
                originalTitle = updatedMovie.originalTitle,
                releaseDate = updatedMovie.releaseDate,
                productionYear = updatedMovie.productionYear,
                runtime = Duration.ofMinutes(updatedMovie.length),
                poster = updatedMovie.posterUrl,
                genres = updatedMovie.genres.map { (name) -> name })

        val saved = repo.save(copy)
        log.info("Successfully updated and saved movie[${movie.id}] with SF data")
        return saved
    }

    private fun updateFromImdbById(movie: Movie) {
        log.info("Fetching extended movie info from IMDb by ID for ${movie.imdbId}")
        val updatedInfo = fetchOmdbExtendedInfo(OMDBAPI_URL + "/?i={id}", mapOf("id" to movie.imdbId))
        if (updatedInfo == null) {
            log.warn("Unable to find movie on OMDb with for imdb id ${movie.imdbId}")
            throw ExternalProviderException()
        }

        val copy = movie.copy(synopsis = updatedInfo.synopsis, productionYear = updatedInfo.productionYear,
                poster = updatedInfo.poster, genres = updatedInfo.genres)

        repo.save(copy)
        log.info("Successfully updated movie with extended information")
    }

    private fun updateFromImdbByTitle(movie: Movie) {
        log.warn("Fetching extended movie info from IMDb by title for ${movie.title} - NOT SUPPORTED YET")
    }

    private fun updateImdbIdBasedOnTitleAndYear(movie: Movie) {
        val title = movie.originalTitle ?: movie.title

        log.info("Fetching IMDb id for '$title'")
        val updatedInfo = fetchOmdbExtendedInfo(OMDBAPI_URL + "/?t={title}&y={year}",
                mapOf("title" to title, "year" to movie.productionYear))

        if (updatedInfo == null) {
            log.info("Movie with title '$title' not found on OMDb")
            return
        }

        log.info("Updating Imdb id to ${updatedInfo.imdbId} for movie[id=${movie.id}]")
        val copy = movie.copy(imdbId = updatedInfo.imdbId)

        repo.save(copy)
        log.info("Successfully updated movie with new IMDb id")
    }

    private fun fetchOmdbExtendedInfo(uri: String, params: Map<String, Any?>): Movie? =
            restTemplate.getForEntity(uri, OmdbApiMovieDTO::class.java, params).body.toMovie()

    private fun fetchInfoFromSf(sfId: String): Movie {
        val responseEntity = restTemplate
                .exchange(SF_API_URL + "/v1/movies/{sfId}", HttpMethod.GET, httpEntity, SfExtendedMovieDTO::class.java, sfId)
        return responseEntity.body.toMovie()
    }

    data class ExternalMovieIdDTO(val imdb: String? = null,
                                  val sf: String? = null)

    private fun OmdbApiMovieDTO.toMovie(): Movie? {
        if (!this.Response.toBoolean()) return null

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

    data class ScreenDTO(val localTime: LocalTime,
                         val screen: String,
                         val cinema: String,
                         val tags: List<SfTag>)

    data class SavedEntitiesDTO(val count: Int,
                                val message: String)

}
