package rocks.didit.sefilm.database.repositories

import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository
import rocks.didit.sefilm.database.entities.Ticket
import rocks.didit.sefilm.domain.UserID
import java.util.*

@Repository
interface TicketRepository : CrudRepository<Ticket, String> {
  fun findByShowingIdAndAssignedToUser(showingId: UUID, userId: UserID): List<Ticket>

  fun findByShowingId(showingId: UUID): List<Ticket>

  fun findByAssignedToUser(userId: UserID): List<Ticket>
}