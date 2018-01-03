package rocks.didit.sefilm.web.controllers

import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RestController
import rocks.didit.sefilm.Application
import rocks.didit.sefilm.MissingSfIdException
import rocks.didit.sefilm.NotFoundException
import rocks.didit.sefilm.clients.ImdbClient
import rocks.didit.sefilm.database.entities.Movie
import rocks.didit.sefilm.database.entities.SfMeta
import rocks.didit.sefilm.database.repositories.MovieRepository
import rocks.didit.sefilm.database.repositories.SfMetaRepository
import rocks.didit.sefilm.domain.MovieTitleExtension
import rocks.didit.sefilm.domain.dto.SavedEntitiesDTO
import rocks.didit.sefilm.domain.dto.SfShowingDTO
import rocks.didit.sefilm.schedulers.AsyncMovieUpdater
import rocks.didit.sefilm.services.MovieService
import rocks.didit.sefilm.services.SFService
import java.time.Instant
import java.util.*

@RestController
class MovieController(
  private val movieService: MovieService,
  private val repo: MovieRepository,
  private val metaRepo: SfMetaRepository,
  private val sfClient: SFService,
  private val imdbClient: ImdbClient,
  private val asyncMovieUpdater: AsyncMovieUpdater,
  private val movieTitleTrimmer: MovieTitleExtension) {

  companion object {
    private const val PATH = Application.API_BASE_PATH + "/movies"
    private const val PATH_WITH_ID = PATH + "/{id}"
  }

  @GetMapping(PATH, produces = [(MediaType.APPLICATION_JSON_UTF8_VALUE)])
  fun findAll() = movieService.allMovies()

  @GetMapping(PATH_WITH_ID, produces = [(MediaType.APPLICATION_JSON_UTF8_VALUE)])
  fun findOne(@PathVariable id: UUID): Movie {
    return movieService.getMovie(id).orElseThrow { NotFoundException("movie '$id'") }
  }

  /*@PostMapping(PATH, consumes = [(MediaType.APPLICATION_JSON_UTF8_VALUE)], produces = [(MediaType.APPLICATION_JSON_UTF8_VALUE)])
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
  }*/

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
  fun findSfDates(@PathVariable id: UUID): Collection<SfShowingDTO> {
    val movie = repo.findById(id).orElseThrow { NotFoundException("movie '$id") }
    if (movie.sfId == null) throw MissingSfIdException()

    return sfClient.getShowingDates(movie.sfId)
  }

}
