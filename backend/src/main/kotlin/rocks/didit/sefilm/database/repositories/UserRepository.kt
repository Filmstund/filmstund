package rocks.didit.sefilm.database.repositories

import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository
import rocks.didit.sefilm.database.entities.User
import rocks.didit.sefilm.domain.SfMembershipId
import rocks.didit.sefilm.domain.TicketNumber
import rocks.didit.sefilm.domain.UserID
import java.util.*

@Repository
interface UserRepository : CrudRepository<User, UserID> {
  fun findBySfMembershipIdIgnoreCase(sfMembershipId: SfMembershipId): User?
  fun findByCalendarFeedId(calendarFeedId: UUID): User?
  fun existsByForetagsbiljetterNumber(biljett: TicketNumber): Boolean
}
