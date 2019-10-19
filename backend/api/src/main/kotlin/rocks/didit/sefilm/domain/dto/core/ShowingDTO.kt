package rocks.didit.sefilm.domain.dto.core

import rocks.didit.sefilm.domain.PhoneNumber
import rocks.didit.sefilm.domain.SEK
import rocks.didit.sefilm.domain.id.Base64ID
import rocks.didit.sefilm.domain.id.FilmstadenShowingID
import rocks.didit.sefilm.domain.id.MovieID
import rocks.didit.sefilm.domain.id.ShowingID
import rocks.didit.sefilm.domain.id.UserID
import java.time.Instant
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime

data class ShowingDTO(
  val id: ShowingID = ShowingID.random(),
  val webId: Base64ID = Base64ID.random(),
  val filmstadenShowingId: FilmstadenShowingID? = null,
  val slug: String,
  val date: LocalDate,
  val time: LocalTime,
  val movieId: MovieID,
  val movieTitle: String,
  val location: LocationDTO?,
  val cinemaScreen: CinemaScreenDTO? = null,
  val price: SEK? = SEK.ZERO,
  val ticketsBought: Boolean = false,
  val admin: UserID,
  val payToUser: UserID,
  val payToPhone: PhoneNumber? = null,
  val lastModifiedDate: Instant = Instant.now(),
  val createdDate: Instant = Instant.now()
) {
  val datetime: LocalDateTime
    get() = LocalDateTime.of(date, time)
}
