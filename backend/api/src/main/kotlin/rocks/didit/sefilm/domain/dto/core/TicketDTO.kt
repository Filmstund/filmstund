package rocks.didit.sefilm.domain.dto.core

import java.time.LocalDate
import java.time.LocalTime
import java.util.*

data class TicketDTO(
  val id: String,
  val showingId: UUID,
  var assignedToUser: UUID,
  val profileId: String? = null,
  val barcode: String,
  val customerType: String,
  val customerTypeDefinition: String,
  val cinema: String,
  val cinemaCity: String? = null,
  val screen: String,
  val seatRow: Int,
  val seatNumber: Int,
  val date: LocalDate,
  val time: LocalTime,
  val movieName: String,
  val movieRating: String, // 15 år, 11 år etc.
  val showAttributes: Set<String> = setOf() // "textad", "en" etc
)
