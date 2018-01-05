package rocks.didit.sefilm.database.repositories

import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository
import rocks.didit.sefilm.database.entities.User
import rocks.didit.sefilm.domain.SfMembershipId
import rocks.didit.sefilm.domain.TicketNumber
import rocks.didit.sefilm.domain.UserID

@Repository
interface UserRepository : CrudRepository<User, UserID> {
  fun findBySfMembershipId(sfMembershipId: SfMembershipId): User?

  fun existsByForetagsbiljetterNumber(biljett: TicketNumber): Boolean
}
