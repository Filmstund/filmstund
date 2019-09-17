package rocks.didit.sefilm.database.repositories

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import rocks.didit.sefilm.database.entities.Showing
import rocks.didit.sefilm.database.entities.Ticket
import rocks.didit.sefilm.database.entities.User
import java.util.*

@Suppress("FunctionName")
@Repository
interface TicketRepository : JpaRepository<Ticket, String> {
  fun findByShowingIdAndAssignedToUser_Id(showingId: UUID, userId: UUID): List<Ticket>

  fun findByShowingAndAssignedToUser(showing: Showing, user: User): List<Ticket>

  fun findByShowing(showing: Showing): List<Ticket>

  fun findByShowing_Id(showingId: UUID): List<Ticket>

  fun deleteAllByShowing(showing: Showing): Int

  //fun findByAssignedToUser(userId: UserID): List<Ticket>
}