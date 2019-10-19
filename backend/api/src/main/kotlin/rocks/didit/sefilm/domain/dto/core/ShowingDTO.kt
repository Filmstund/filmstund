package rocks.didit.sefilm.domain.dto.core

import rocks.didit.sefilm.domain.id.Base64ID
import rocks.didit.sefilm.domain.PhoneNumber
import rocks.didit.sefilm.domain.SEK
import rocks.didit.sefilm.domain.dto.FilmstadenLiteScreenDTO
import java.time.Instant
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime
import java.util.*

data class ShowingDTO(
  val id: UUID = UUID.randomUUID(),
  val webId: Base64ID = Base64ID.random(),
  val filmstadenShowingId: String? = null,
  val slug: String,
  val date: LocalDate,
  val time: LocalTime,
  val movieId: UUID,
  val movieTitle: String,
  val location: LocationDTO?,
  val cinemaScreen: FilmstadenLiteScreenDTO? = null,
  val price: SEK? = SEK.ZERO,
  val ticketsBought: Boolean = false,
  val admin: UUID,
  val payToUser: UUID,
  val payToPhone: PhoneNumber? = null,
  val lastModifiedDate: Instant = Instant.now(),
  val createdDate: Instant = Instant.now()
) {
  val datetime: LocalDateTime
    get() = LocalDateTime.of(date, time)
}
