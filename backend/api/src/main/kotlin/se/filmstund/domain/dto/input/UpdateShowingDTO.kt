package se.filmstund.domain.dto.input

import se.filmstund.domain.id.UserID
import java.time.LocalDate
import java.time.LocalTime

data class UpdateShowingDTO(
  val price: Long = 0,
  val payToUser: UserID,
  val location: String = "Filmstaden Bergakungen",
  val filmstadenRemoteEntityId: String? = null,
  val time: LocalTime = LocalTime.NOON,
  val date: LocalDate
)