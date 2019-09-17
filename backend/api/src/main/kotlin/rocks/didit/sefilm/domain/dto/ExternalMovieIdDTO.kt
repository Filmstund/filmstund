package rocks.didit.sefilm.domain.dto

data class ExternalMovieIdDTO(
  val imdb: String? = null,
  val tmdb: Long? = null,
  val filmstaden: String? = null
)