package se.filmstund.domain.dto.core

import org.jdbi.v3.core.mapper.Nested
import se.filmstund.domain.id.ShowingID
import se.filmstund.domain.id.UserID
import java.time.LocalDate
import java.time.LocalTime

data class TicketDTO(
  val id: String,
  val showingId: ShowingID,
  var assignedToUser: UserID,
  val profileId: String? = null,
  val barcode: String,
  val customerType: String,
  val customerTypeDefinition: String,
  val cinema: String,
  val cinemaCity: String? = null,
  val screen: String,
  @Nested("seat")
  val seat: Seat,
  val date: LocalDate,
  val time: LocalTime,
  val movieName: String,
  val movieRating: String, // 15 år, 11 år etc.
  val attributes: Set<String> = setOf() // "textad", "en" etc
)

data class Seat(val row: Int, val number: Int) {
  init {
    require(number >= 0) { "Seat number must be positive" }
    require(row >= 0) { "Seat row must be positive" }
  }
}
