package rocks.didit.sefilm.web.controllers

import org.slf4j.LoggerFactory
import org.springframework.cache.annotation.Cacheable
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.util.UriComponentsBuilder
import rocks.didit.sefilm.*
import rocks.didit.sefilm.clients.ImdbClient
import rocks.didit.sefilm.clients.SfClient
import rocks.didit.sefilm.database.entities.Movie
import rocks.didit.sefilm.database.entities.SfMeta
import rocks.didit.sefilm.database.repositories.MovieRepository
import rocks.didit.sefilm.database.repositories.SfMetaRepository
import rocks.didit.sefilm.domain.MovieTitleExtension
import rocks.didit.sefilm.domain.dto.*
import rocks.didit.sefilm.schedulers.AsyncMovieUpdater
import java.time.Instant
import java.time.LocalDate
import java.util.*

@RestController
class MovieController(private val repo: MovieRepository,
                      private val metaRepo: SfMetaRepository,
                      private val sfClient: SfClient,
                      private val imdbClient: ImdbClient,
                      private val asyncMovieUpdater: AsyncMovieUpdater,
                      private val movieTitleTrimmer: MovieTitleExtension) {

  companion object {
    private const val PATH = Application.API_BASE_PATH + "/movies"
    private const val PATH_WITH_ID = PATH + "/{id}"
  }

  private val log = LoggerFactory.getLogger(MovieController::class.java)

  @GetMapping(PATH, produces = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE))
  fun findAll() = repo.findByArchivedFalse().sortedByDescending { it.popularity }

  @GetMapping(PATH_WITH_ID, produces = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE))
  fun findOne(@PathVariable id: UUID): Movie {
    val movie = repo.findById(id).orElseThrow { NotFoundException("movie '$id'") }
    return movie
  }

  @PostMapping(PATH, consumes = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE), produces = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE))
  fun saveMovie(@RequestBody body: ExternalMovieIdDTO, b: UriComponentsBuilder): ResponseEntity<Movie> {
    val movieInfo = when {
      body.sf != null -> sfClient.fetchExtendedInfo(body.sf)?.toMovie()
      body.tmdb != null -> imdbClient.movieDetailsExact(body.tmdb.toTmdbId()).toMovie()
      body.imdb != null -> imdbClient.movieDetails(body.imdb.toImdbId()).toMovie()
      else -> throw MissingParametersException()
    } ?: return ResponseEntity.unprocessableEntity().build()

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
      .filter { (ncgId, title) -> !movieTitleTrimmer.isTitleUnwanted(title) && ourMovies.firstOrNull { our -> our.sfId == ncgId } == null }
      .map { (ncgId, title, releaseDate, _, posterUrl) ->
        Movie(title = movieTitleTrimmer.trimTitle(title), sfId = ncgId, releaseDate = releaseDate, poster = posterUrl)
      }

    val savedEntities = repo.saveAll(newMoviesWeHaventPreviouslySeen)
    metaRepo.save(SfMeta("sfpopulate", Instant.now(), "Previously saved ${savedEntities.count()} new movies from SF", savedEntities.count()))

    asyncMovieUpdater.extendMovieInfo(savedEntities)
    return SavedEntitiesDTO(savedEntities.count(), "Fetched and saved new movies from SF")
  }

  @GetMapping(PATH_WITH_ID + "/sfdates")
  @Cacheable("sfdates")
  fun findSfDates(@PathVariable id: UUID): Collection<LocalDate> {
    val movie = repo.findById(id).orElseThrow { NotFoundException("movie '$id") }
    if (movie.sfId == null) throw MissingSfIdException()

    return sfClient.getShowingDates(movie.sfId)
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
        ScreenDTO(show.time.toLocalTime(), show.screen.screenName, show.cinemaName, tags)
      }
  }

  private fun convertTags(attributes: List<SfAttributeDTO>): MutableList<SfTag> {
    return attributes.map { a ->
      try {
        SfTag.valueOf(a.displayName)
      } catch (e: IllegalArgumentException) {
        log.warn("SfTag with name $a does not exist")
        return@map null
      }
    }.filterNotNull().toMutableList()
  }
}
