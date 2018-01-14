package rocks.didit.sefilm.database.entities

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import rocks.didit.sefilm.domain.UserID
import java.time.LocalDate
import java.time.LocalTime
import java.util.*

@Document
data class Ticket(
  @Id
  val id: String = "",
  val showingId: UUID,
  val assignedToUser: UserID,
  val profileId: String?,
  val customerType: String,
  val customerTypeDefinition: String,
  val cinema: String,
  val cinemaCity: String,
  val screen: String,
  val seat: Seat,
  val date: LocalDate,
  val time: LocalTime,
  val movieName: String,
  val movieRating: String, // 15 år, 11 år etc.
  val showAttributes: List<String> // "textad", "en" etc
)

data class Seat(val row: Int, val number: Int)
