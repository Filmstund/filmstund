package rocks.didit.sefilm.database.repositories

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import rocks.didit.sefilm.database.entities.User
import rocks.didit.sefilm.domain.UserID
import java.util.*

@Repository
interface UserRepository : JpaRepository<User, UserID> {
  //fun findByFilmstadenMembershipId(filmstadenMembershipId: FilmstadenMembershipId): User?
  fun findByCalendarFeedId(calendarFeedId: UUID): User?
  //fun existsByForetagsbiljetterNumber(biljett: TicketNumber): Boolean
}
