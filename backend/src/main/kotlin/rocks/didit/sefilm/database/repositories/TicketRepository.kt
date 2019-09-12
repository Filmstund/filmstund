package rocks.didit.sefilm.database.repositories

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import rocks.didit.sefilm.database.entities.Ticket

@Repository
interface TicketRepository : JpaRepository<Ticket, String> {
  //fun findByShowingIdAndAssignedToUser(showingId: UUID, userId: UserID): List<Ticket>

  //fun findByShowingId(showingId: UUID): List<Ticket>

  //fun findByAssignedToUser(userId: UserID): List<Ticket>
}