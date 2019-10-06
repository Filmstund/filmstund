package rocks.didit.sefilm.database.dao

import org.jdbi.v3.sqlobject.statement.SqlQuery
import rocks.didit.sefilm.domain.dto.core.TicketDTO
import java.util.*

interface TicketDao {
  @SqlQuery("SELECT * FROM ticket WHERE showing_id = :showingId")
  fun findByShowing(showingId: UUID): List<TicketDTO>

  @SqlQuery("SELECT * FROM ticket WHERE showing_id = :showingId AND assigned_to_user = :userId")
  fun findByUserAndShowing(userId: UUID, showingId: UUID): List<TicketDTO>
}