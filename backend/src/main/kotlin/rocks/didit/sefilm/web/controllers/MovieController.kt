package rocks.didit.sefilm.web.controllers

import org.slf4j.LoggerFactory
import org.springframework.cache.annotation.Cacheable
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.util.UriComponentsBuilder
import rocks.didit.sefilm.*
import rocks.didit.sefilm.clients.OmdbClient
import rocks.didit.sefilm.clients.SfClient
import rocks.didit.sefilm.database.entities.Movie
import rocks.didit.sefilm.database.entities.SfMeta
import rocks.didit.sefilm.database.repositories.MovieRepository
import rocks.didit.sefilm.database.repositories.SfMetaRepository
import rocks.didit.sefilm.domain.dto.SfAttributeDTO
import rocks.didit.sefilm.domain.dto.SfTag
import java.time.Duration
import java.time.Instant
import java.time.LocalDate
import java.util.*


@RestController
class MovieController(private val repo: MovieRepository,
                      private val metaRepo: SfMetaRepository,
                      private val sfClient: SfClient,
                      private val omdbClient: OmdbClient) {

    companion object {
        private const val PATH = Application.API_BASE_PATH + "/movies"
        private const val PATH_WITH_ID = PATH + "/{id}"
    }

    private val log = LoggerFactory.getLogger(MovieController::class.java)

    @GetMapping(PATH, produces = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE))
    fun findAll() = repo.findAll()

    @GetMapping(PATH_WITH_ID, produces = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE))
    fun findOne(@PathVariable id: UUID): Movie {
        val movie = repo.findById(id).orElseThrow { NotFoundException("movie '$id'") }
        when {
        // FIXME: move this to /scrape or something
            movie.needsMoreInfo() -> fetchExtendedInfoForMovie(movie)
            movie.isMissingImdbId() -> updateImdbIdBasedOnTitleAndYear(movie)
        }
        return movie
    }

    @PostMapping(PATH, consumes = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE), produces = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE))
    fun saveMovie(@RequestBody body: ExternalMovieIdDTO, b: UriComponentsBuilder): ResponseEntity<Movie> {
        val movieInfo = when {
            body.sf != null -> sfClient.fetchExtendedInfo(body.sf).toMovie()
            body.imdb != null -> omdbClient.fetchByImdbId(body.imdb)?.toMovie()
            else -> throw MissingParametersException()
        }

        if (movieInfo == null) {
            log.info("Movie info not found for $body")
            throw ExternalProviderException()
        }

        // FIXME: check if a movie with the supplied sf or imdb id already exists
        val movie = repo.save(movieInfo)
        val createdUri = b.path(PATH_WITH_ID).buildAndExpand(movie.id).toUri()
        return ResponseEntity.created(createdUri).body(movie)
    }

    @GetMapping(PATH + "/sf/meta")
    fun sfMetaData(): SfMeta =
            metaRepo
                    .findById("sfpopulate")
                    .orElseGet { SfMeta(description = "Never fetched any movies from SF") }

    @PostMapping(PATH + "/sf/populate")
    fun populateFromSf(): SavedEntitiesDTO {
        val sfMovies = sfClient.allMovies()

        val ourMovies = repo.findAll()
        val newMoviesWeHaventPreviouslySeen = sfMovies
                .filter { sf -> ourMovies.firstOrNull { our -> our.sfId == sf.ncgId } == null }
                .map { (ncgId, title, releaseDate, _, posterUrl) ->
                    Movie(title = title, sfId = ncgId, releaseDate = releaseDate, poster = posterUrl)
                }

        val savedEntities = repo.saveAll(newMoviesWeHaventPreviouslySeen)
        metaRepo.save(SfMeta("sfpopulate", Instant.now(), "Previously saved ${savedEntities.count()} new movies from SF", savedEntities.count()))

        return SavedEntitiesDTO(savedEntities.count(), "Fetched and saved new movies from SF")
    }

    @GetMapping(PATH_WITH_ID + "/sfdates")
    @Cacheable("sfdates")
    fun findSfDates(@PathVariable id: UUID): Collection<LocalDate> {
        val movie = repo.findById(id).orElseThrow { NotFoundException("movie '$id") }
        if (movie.sfId == null) throw MissingSfIdException()

        return sfClient.getDatesAndLocations(movie.sfId).dates
    }

    @GetMapping(PATH_WITH_ID + "/sfdates/{date}")
    @Cacheable("sfdate")
    fun findSfTimes(@PathVariable id: UUID, @PathVariable date: String): Collection<ScreenDTO> {
        if (!date.matches(Regex("^\\d{4}-\\d{2}-\\d{2}$"))) throw BadRequestException("Wrong date format, requires yyyy-mm-dd")
        val movie = repo.findById(id).orElseThrow { NotFoundException("movie '$id'") }
        if (movie.sfId == null) throw MissingSfIdException()

        val screens = sfClient.getScreensForDateAndMovie(movie.sfId, date)
        return screens.entities
                .flatMap { e -> e.shows }
                .map { show ->
                    val tags = convertTags(show.attributes)
                    if (show.screen.screenName.endsWith("VIP")) {
                        tags.add(SfTag.VIP)
                    }

                    ScreenDTO(show.time.toLocalTime(), show.screen.screenName, show.cinemaName, tags)
                }
    }

    private fun convertTags(attributes: List<SfAttributeDTO>): MutableList<SfTag> {
        return attributes.map { a ->
            try {
                SfTag.valueOf(a.displayName)
            } catch(e: IllegalArgumentException) {
                log.warn("SfTag with name $a does not exist")
                return@map null
            }
        }.filterNotNull().toMutableList()

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
        val updatedMovie = sfClient.fetchExtendedInfo(movie.sfId!!)

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
        val updatedInfo = omdbClient.fetchByImdbId(movie.imdbId!!)?.toMovie()
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
        val updatedInfo = omdbClient.fetchByTitleAndYear(title, movie.productionYear!!)?.toMovie()

        if (updatedInfo == null) {
            log.info("Movie with title '$title' not found on OMDb")
            return
        }

        log.info("Updating Imdb id to ${updatedInfo.imdbId} for movie[id=${movie.id}]")
        val copy = movie.copy(imdbId = updatedInfo.imdbId)

        repo.save(copy)
        log.info("Successfully updated movie with new IMDb id")
    }
}
