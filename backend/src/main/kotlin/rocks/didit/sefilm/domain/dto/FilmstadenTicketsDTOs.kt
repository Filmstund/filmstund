package rocks.didit.sefilm.domain.dto

import java.time.LocalDate
import java.time.LocalTime

data class FilmstadenTicketDTO(
  val id: String,
  val profileId: String?,
  val customerTypeDefinition: String,
  val customerType: String,
  val qrCode: String,
  val toiletCode: String,
  val isRefunded: Boolean,
  val cinema: FilmstadenCinemaDTO,
  val movie: FilmstadenNamedMovieDTO,
  val show: FilmstadenTicketShowDTO,
  val seat: FilmstadenSeatDTO,
  val screen: FilmstadenTicketScreenDTO,
  val receipt: Map<String, Any>,
  val labels: Map<String, Any?>,
  val products: List<Map<Any, Any>>
)

data class FilmstadenCinemaDTO(val city: FilmstadenCityDTO, val title: String, val company: Map<String, Any?>)

data class FilmstadenCityDTO(val name: String?)

data class FilmstadenTicketScreenDTO(val title: String)

data class FilmstadenNamedMovieDTO(val title: String, val rating: FilmstadenDisplayNameDTO)

data class FilmstadenDisplayNameDTO(val displayName: String)

data class FilmstadenSeatDTO(
  val number: Int,
  val row: Int,
  val section: String,
  val type: String,
  val unnumberedText: String?
)

data class FilmstadenTicketShowDTO(
  val attributes: List<FilmstadenDisplayNameDTO>,
  val date: LocalDate,
  val time: LocalTime,
  val unnumbered: Boolean
)