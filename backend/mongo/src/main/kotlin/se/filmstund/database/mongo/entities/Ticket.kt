package se.filmstund.database.mongo.entities

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import se.filmstund.domain.id.GoogleId
import java.time.LocalDate
import java.time.LocalTime
import java.util.*

@Document
@Deprecated(message = "")
internal data class Ticket(
  @Id
  val id: String = "",
  val showingId: UUID,
  val assignedToUser: GoogleId,
  val profileId: String?,
  val barcode: String,
  val customerType: String,
  val customerTypeDefinition: String,
  val cinema: String,
  val cinemaCity: String?,
  val screen: String,
  val seat: Seat,
  val date: LocalDate,
  val time: LocalTime,
  val movieName: String,
  val movieRating: String, // 15 år, 11 år etc.
  val showAttributes: List<String> // "textad", "en" etc
)

@Deprecated(message = "")
data class Seat(val row: Int, val number: Int)
