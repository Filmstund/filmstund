package rocks.didit.sefilm.database.repositories

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import rocks.didit.sefilm.database.entities.User
import rocks.didit.sefilm.domain.FilmstadenMembershipId
import rocks.didit.sefilm.domain.UserID
import rocks.didit.sefilm.domain.dto.PublicUserDTO
import java.util.*

@Repository
interface UserRepository : JpaRepository<User, UUID> {
  @Query(value = "select new rocks.didit.sefilm.domain.dto.PublicUserDTO(u.id, u.firstName, u.lastName, u.nick, u.phone, u.avatar) from User u")
  fun findAllPublicUsers(): List<PublicUserDTO>

  @Query(value = "select new rocks.didit.sefilm.domain.dto.PublicUserDTO(u.id, u.firstName, u.lastName, u.nick, u.phone, u.avatar) from User u where u.id = :userId")
  fun findPublicUserById(userId: UUID): PublicUserDTO?

  //fun findByFilmstadenMembershipId(filmstadenMembershipId: FilmstadenMembershipId): User?
  fun findByCalendarFeedId(calendarFeedId: UUID): User?

  //fun existsByForetagsbiljetterNumber(biljett: TicketNumber): Boolean
  fun existsByGoogleId(googleId: UserID): Boolean

  fun findByGoogleId(googleId: UserID): User?

  @Query(value = "select u.id from User u where u.filmstadenId = :filmstadenId")
  fun findUserIdByFilmstadenId(filmstadenId: FilmstadenMembershipId): UUID?
}
