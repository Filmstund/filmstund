package se.filmstund

import org.jdbi.v3.core.Handle
import org.jdbi.v3.sqlobject.kotlin.attach
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import se.filmstund.database.dao.AttendeeDao
import se.filmstund.database.dao.LocationDao
import se.filmstund.database.dao.MovieDao
import se.filmstund.database.dao.ShowingDao
import se.filmstund.database.dao.TicketDao
import se.filmstund.database.dao.UserDao
import se.filmstund.domain.dto.core.PublicUserDTO

internal fun maybeCurrentLoggedInUser(): PublicUserDTO? {
  val authentication: Authentication? = SecurityContextHolder.getContext().authentication
  return if (authentication != null && authentication.isAuthenticated) {
    authentication.principal as PublicUserDTO
  } else {
    null
  }
}

internal fun currentLoggedInUser(): PublicUserDTO =
  maybeCurrentLoggedInUser() ?: throw AccessDeniedException("User nog logged in!")

data class Daos(
  val userDao: UserDao,
  val movieDao: MovieDao,
  val locationDao: LocationDao,
  val showingDao: ShowingDao,
  val attendeeDao: AttendeeDao,
  val ticketDao: TicketDao
)

fun Handle.toDaos(): Daos {
  val userDao = attach<UserDao>()
  val movieDao = attach<MovieDao>()
  val locationDao = attach<LocationDao>()
  val showingDao = attach<ShowingDao>()
  val attendeeDao = attach<AttendeeDao>()
  val ticketDao = attach<TicketDao>()

  return Daos(userDao, movieDao, locationDao, showingDao, attendeeDao, ticketDao)
}
