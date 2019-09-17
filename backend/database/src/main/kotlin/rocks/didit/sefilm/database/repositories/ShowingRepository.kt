package rocks.didit.sefilm.database.repositories

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import rocks.didit.sefilm.database.entities.Showing
import rocks.didit.sefilm.domain.Base64ID
import java.time.LocalDate
import java.util.*

@Suppress("FunctionName")
@Repository
interface ShowingRepository : JpaRepository<Showing, UUID> {
  fun findByIdAndAdmin_Id(showingId: UUID, adminId: UUID): Showing?
  /**
   * Find showings where a user is either an admin or a participant
   */
  @Query(value = "select s from Showing s join s.admin a join s.participants p where a.id = :userId or p.id.user.id = :userId")
  fun findByUserId(userId: UUID): List<Showing>

  fun findByMovieIdOrderByDateDesc(movieId: UUID): List<Showing>

  fun findByWebId(webId: Base64ID): Showing?

  fun findByDateAfterOrderByDateDesc(dateAfter: LocalDate): List<Showing>
}
