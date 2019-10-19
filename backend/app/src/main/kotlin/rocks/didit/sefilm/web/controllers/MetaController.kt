package rocks.didit.sefilm.web.controllers

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.servlet.ModelAndView
import rocks.didit.sefilm.Application
import rocks.didit.sefilm.NotFoundException
import rocks.didit.sefilm.domain.dto.core.ShowingDTO
import rocks.didit.sefilm.domain.id.Base64ID
import rocks.didit.sefilm.services.MovieService
import rocks.didit.sefilm.services.ShowingService
import rocks.didit.sefilm.web.controllers.MetaController.Companion.PATH
import java.time.format.DateTimeFormatter
import java.util.*

@RestController
@RequestMapping(PATH)
class MetaController(
  private val showingService: ShowingService,
  private val movieService: MovieService
) {
  companion object {
    const val PATH = "${Application.API_BASE_PATH}/meta"
  }

  @GetMapping("/showings/{webId}/{slug}")
  fun showingMeta(@PathVariable webId: String, @PathVariable slug: String): ModelAndView {
    val showing = showingService.getShowing(Base64ID(webId)) ?: throw NotFoundException("showing with WebID=$webId")
    return createViewModelFromShowing(showing)
  }

  @GetMapping("/showings/{showingId}")
  fun showingMeta(@PathVariable showingId: UUID): ModelAndView {
    val showing = showingService.getShowingOrThrow(showingId)
    return createViewModelFromShowing(showing)
  }

  private fun createViewModelFromShowing(showing: ShowingDTO): ModelAndView {
    val movie = movieService.getMovieOrThrow(showing.movieId)
    return ModelAndView("metaShowing")
      .addObject("movieTitle", movie.title)
      .addObject("movieDescription", movie.synopsis ?: "Come watch ${movie.title} with us")
      .addObject("date", showing.datetime.format(DateTimeFormatter.ofPattern("eeee d MMM HH:mm", Locale.ENGLISH)))
      .addObject("hasPoster", movie.poster != null)
      .addObject("posterUrl", movie.poster ?: "")
      .addObject("slug", showing.slug)
      .addObject("webId", showing.webId.id)
  }
}