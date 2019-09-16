package rocks.didit.sefilm.database.mongo.repositories

import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository
import rocks.didit.sefilm.database.mongo.entities.Ticket
import rocks.didit.sefilm.domain.UserID
import java.util.*

@Repository
@Deprecated(message = "")
interface TicketMongoRepository : CrudRepository<Ticket, String> {
  fun findByShowingIdAndAssignedToUser(showingId: UUID, userId: UserID): List<Ticket>

  fun findByShowingId(showingId: UUID): List<Ticket>

  fun findByAssignedToUser(userId: UserID): List<Ticket>
}