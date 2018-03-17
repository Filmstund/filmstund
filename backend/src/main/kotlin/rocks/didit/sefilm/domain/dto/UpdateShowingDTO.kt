package rocks.didit.sefilm.domain.dto

import java.time.LocalDate
import java.time.LocalTime

data class UpdateShowingDTO(
  val price: Long = 0,
  val private: Boolean = false,
  val payToUser: String = "N/A",
  val expectedBuyDate: LocalDate? = null,
  val location: String = "Filmstaden Bergakungen",
  val sfScreen: SfLiteScreenDTO? = null,
  val time: LocalTime = LocalTime.NOON
)