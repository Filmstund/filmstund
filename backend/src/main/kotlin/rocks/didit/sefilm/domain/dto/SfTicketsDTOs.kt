package rocks.didit.sefilm.domain.dto

import java.time.LocalDate
import java.time.LocalTime

data class SfTicketDTO(val cinema: SfCinemaDTO,
                       val customerType: String,
                       val customerTypeDefinition: String,
                       val id: String,
                       val labels: Map<String, Any?>,
                       val movie: SfNamedMovieDTO,
                       val products: List<Map<Any, Any>>,
                       val receipt: Map<String, Any>,
                       val screen: SfTicketScreenDTO,
                       val seat: SfSeatDTO,
                       val show: SfTicketShowDTO,
                       val toiletCode: String
)

data class SfCinemaDTO(val city: SfCityDTO, val title: String, val company: Map<String, Any?>)

data class SfCityDTO(val name: String)

data class SfTicketScreenDTO(val title: String)

data class SfNamedMovieDTO(val title: String, val rating: SfDisplayNameDTO)

data class SfDisplayNameDTO(val displayName: String)

data class SfSeatDTO(val number: Int, val row: Int, val section: String, val type: String, val unnumberedText: String?)

data class SfTicketShowDTO(val attributes: List<SfDisplayNameDTO>, val date: LocalDate, val time: LocalTime, val unnumbered: Boolean)