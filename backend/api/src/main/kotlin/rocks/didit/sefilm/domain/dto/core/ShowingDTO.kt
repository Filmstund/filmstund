package rocks.didit.sefilm.domain.dto.core

import org.jdbi.v3.core.mapper.Nested
import rocks.didit.sefilm.domain.Base64ID
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
  @Nested("l")
  val location: LocationDTO?,
  @Nested("cs")
  val cinemaScreen: FilmstadenLiteScreenDTO? = null,
  val price: SEK? = SEK.ZERO,
  val ticketsBought: Boolean = false,
  val admin: UUID,
  val payToUser: UUID,
  val lastModifiedDate: Instant = Instant.now(),
  val createdDate: Instant = Instant.now()
) {
  val datetime: LocalDateTime
    get() = LocalDateTime.of(date, time)
}
