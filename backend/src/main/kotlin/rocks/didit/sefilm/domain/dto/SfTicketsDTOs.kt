package rocks.didit.sefilm.domain.dto

import java.time.LocalDate
import java.time.LocalTime

data class SfTicketDTO(
  val id: String,
  val profileId: String?,
  val customerTypeDefinition: String,
  val customerType: String,
  val qrCode: String,
  val toiletCode: String,
  val isRefunded: Boolean,
  val cinema: SfCinemaDTO,
  val movie: SfNamedMovieDTO,
  val show: SfTicketShowDTO,
  val seat: SfSeatDTO,
  val screen: SfTicketScreenDTO,
  val receipt: Map<String, Any>,
  val labels: Map<String, Any?>,
  val products: List<Map<Any, Any>>
)

data class SfCinemaDTO(val city: SfCityDTO, val title: String, val company: Map<String, Any?>)

data class SfCityDTO(val name: String)

data class SfTicketScreenDTO(val title: String)

data class SfNamedMovieDTO(val title: String, val rating: SfDisplayNameDTO)

data class SfDisplayNameDTO(val displayName: String)

data class SfSeatDTO(val number: Int, val row: Int, val section: String, val type: String, val unnumberedText: String?)

data class SfTicketShowDTO(
  val attributes: List<SfDisplayNameDTO>,
  val date: LocalDate,
  val time: LocalTime,
  val unnumbered: Boolean
)