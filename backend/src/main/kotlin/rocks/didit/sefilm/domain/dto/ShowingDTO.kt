package rocks.didit.sefilm.domain.dto

import rocks.didit.sefilm.database.entities.Location
import rocks.didit.sefilm.domain.Base64ID
import rocks.didit.sefilm.domain.ParticipantDTO
import rocks.didit.sefilm.domain.SEK
import rocks.didit.sefilm.domain.UserID
import java.time.Instant
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime
import java.util.*

data class ShowingDTO(
  val id: UUID,
  val webId: Base64ID,
  val slug: String,
  val date: LocalDate,
  val time: LocalTime,
  val movieId: UUID,
  val location: Location,
  val sfScreen: SfLiteScreenDTO?,
  val private: Boolean,
  val price: SEK?,
  val ticketsBought: Boolean,
  val admin: UserID,
  val payToUser: UserID,
  val expectedBuyDate: LocalDate?,
  val participants: Collection<ParticipantDTO>,
  val lastModifiedDate: Instant = Instant.EPOCH,
  val createdDate: Instant = Instant.EPOCH
) {
  fun fullDate(): LocalDateTime {
    return LocalDateTime.of(date, time)
  }
}
