package se.filmstund.web.controllers

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.servlet.ModelAndView
import se.filmstund.Application
import se.filmstund.NotFoundException
import se.filmstund.domain.dto.core.ShowingDTO
import se.filmstund.domain.id.Base64ID
import se.filmstund.domain.id.ShowingID
import se.filmstund.services.MovieService
import se.filmstund.services.ShowingService
import se.filmstund.web.controllers.MetaController.Companion.PATH
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
  fun showingMeta(@PathVariable showingId: ShowingID): ModelAndView {
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