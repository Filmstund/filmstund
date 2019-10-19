package rocks.didit.sefilm.domain.dto

import rocks.didit.sefilm.domain.id.UserID
import java.time.LocalDate
import java.time.LocalTime

data class UpdateShowingDTO(
  val price: Long = 0,
  // TODO: remove
  val private: Boolean = false,
  val payToUser: UserID,
  // TODO: remove
  val expectedBuyDate: LocalDate? = null,
  val location: String = "Filmstaden Bergakungen",
  val filmstadenRemoteEntityId: String? = null,
  val time: LocalTime = LocalTime.NOON,
  val date: LocalDate
)