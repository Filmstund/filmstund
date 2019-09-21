package rocks.didit.sefilm.database.dao

import org.jdbi.v3.sqlobject.statement.SqlQuery
import org.jdbi.v3.sqlobject.statement.SqlUpdate
import rocks.didit.sefilm.domain.dto.ShowingDTO
import java.util.*

interface ShowingDao {
  @SqlQuery("SELECT * FROM showing s JOIN location l ON s.location_id = l.name WHERE s.id = :showingId")
  fun findById(showingId: UUID): ShowingDTO?

  @SqlQuery("SELECT exists(SELECT 1 FROM participant p WHERE p.showing_id = :showingId and p.user_id = :userId)")
  fun isParticipantOnShowing(showingId: UUID, userId: UUID): Boolean

  @SqlUpdate("UPDATE showing s SET admin = :newAdmin, pay_to_user = :newAdmin WHERE s.id = :showingId and s.admin = :currentAdmin")
  fun promoteNewUserToAdmin(showingId: UUID, currentAdmin: UUID, newAdmin: UUID): Int

  @SqlUpdate(
    "INSERT INTO showing(id, web_id, slug, date, time, movie_id, location_id, cinema_screen_id, filmstaden_showing_id, price, tickets_bought, admin, pay_to_user) values (:s.id, :s.webId, :s.slug, :s.date, :s.time, :s.movieId, :s.location.name, :s.filmestadenScreen.filmstadenId, :s.filmstadenShowingId, :s.price, :s.ticketsBought, :s.admin, :s.payToUser)"
  )
  fun insertNewShowing(s: ShowingDTO)
}