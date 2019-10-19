package rocks.didit.sefilm.domain.dto

import rocks.didit.sefilm.domain.id.MovieID
import java.time.LocalDate
import java.time.LocalTime

data class CreateShowingDTO(
  val date: LocalDate,
  val time: LocalTime,
  val movieId: MovieID,
  val location: String,
  val filmstadenScreen: FilmstadenLiteScreenDTO?,
  // TODO: remove
  val expectedBuyDate: LocalDate?,
  val filmstadenRemoteEntityId: String?
)