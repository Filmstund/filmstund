package rocks.didit.sefilm

import org.jdbi.v3.core.Handle
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import rocks.didit.sefilm.database.dao.LocationDao
import rocks.didit.sefilm.database.dao.MovieDao
import rocks.didit.sefilm.database.dao.ParticipantDao
import rocks.didit.sefilm.database.dao.ShowingDao
import rocks.didit.sefilm.database.dao.UserDao
import rocks.didit.sefilm.domain.dto.PublicUserDTO

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
  val participantDao: ParticipantDao
)

fun Handle.toDaos(): Daos {
  val userDao = attach(UserDao::class.java)
  val movieDao = attach(MovieDao::class.java)
  val locationDao = attach(LocationDao::class.java)
  val showingDao = attach(ShowingDao::class.java)
  val participantDao = attach(ParticipantDao::class.java)

  return Daos(userDao, movieDao, locationDao, showingDao, participantDao)
}
