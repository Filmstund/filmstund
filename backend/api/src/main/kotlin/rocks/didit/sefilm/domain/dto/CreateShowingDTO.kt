package rocks.didit.sefilm.domain.dto

import java.time.LocalDate
import java.time.LocalTime
import java.util.*

data class CreateShowingDTO(
  val date: LocalDate,
  val time: LocalTime,
  val movieId: UUID,
  val location: String,
  val filmstadenScreen: FilmstadenLiteScreenDTO?,
  val expectedBuyDate: LocalDate?,
  val filmstadenRemoteEntityId: String?
)