package se.filmstund.domain.dto.core

import org.jdbi.v3.core.mapper.Nested
import se.filmstund.domain.PhoneNumber
import se.filmstund.domain.SEK
import se.filmstund.domain.id.Base64ID
import se.filmstund.domain.id.FilmstadenShowingID
import se.filmstund.domain.id.MovieID
import se.filmstund.domain.id.ShowingID
import se.filmstund.domain.id.UserID
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
  @Nested("l")
  val location: LocationDTO,
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
