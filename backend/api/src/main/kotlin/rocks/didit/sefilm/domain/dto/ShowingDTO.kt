package rocks.didit.sefilm.domain.dto

import rocks.didit.sefilm.domain.Base64ID
import rocks.didit.sefilm.domain.SEK
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
  val location: LocationDTO,
  val filmstadenScreen: FilmstadenLiteScreenDTO?,
  val price: SEK?,
  val ticketsBought: Boolean,
  val admin: UUID,
  val payToUser: UUID,
  val lastModifiedDate: Instant = Instant.EPOCH,
  val createdDate: Instant = Instant.EPOCH,
  val filmstadenShowingId: String?
) {
  val datetime: LocalDateTime
    get() = LocalDateTime.of(date, time)
}
