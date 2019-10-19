package rocks.didit.sefilm.database.mongo.repositories

import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository
import rocks.didit.sefilm.database.mongo.entities.Ticket
import rocks.didit.sefilm.domain.id.GoogleId
import java.util.*

@Repository
@Deprecated(message = "")
internal interface TicketMongoRepository : CrudRepository<Ticket, String> {
  fun findByIdNotIn(ids: List<String>): List<Ticket>

  fun findByShowingIdAndAssignedToUser(showingId: UUID, userId: GoogleId): List<Ticket>

  fun findByShowingId(showingId: UUID): List<Ticket>

  fun findByAssignedToUser(userId: GoogleId): List<Ticket>
}