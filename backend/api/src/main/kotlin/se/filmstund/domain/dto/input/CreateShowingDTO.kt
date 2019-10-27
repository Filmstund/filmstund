package se.filmstund.domain.dto.input

import se.filmstund.domain.dto.core.CinemaScreenDTO
import se.filmstund.domain.id.MovieID
import java.time.LocalDate
import java.time.LocalTime

data class CreateShowingDTO(
  val date: LocalDate,
  val time: LocalTime,
  val movieId: MovieID,
  val location: String,
  val filmstadenScreen: CinemaScreenDTO?,
  val filmstadenRemoteEntityId: String?
)