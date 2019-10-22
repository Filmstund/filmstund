package se.filmstund.database.dao

import org.jdbi.v3.sqlobject.config.RegisterKotlinMappers
import org.jdbi.v3.sqlobject.customizer.BindBean
import org.jdbi.v3.sqlobject.customizer.Timestamped
import org.jdbi.v3.sqlobject.kotlin.RegisterKotlinMapper
import org.jdbi.v3.sqlobject.statement.SqlQuery
import org.jdbi.v3.sqlobject.statement.SqlUpdate
import org.jdbi.v3.sqlobject.statement.UseRowReducer
import se.filmstund.NotFoundException
import se.filmstund.database.ShowingLocationScreenReducer
import se.filmstund.domain.SEK
import se.filmstund.domain.dto.core.CinemaScreenDTO
import se.filmstund.domain.dto.core.LocationDTO
import se.filmstund.domain.dto.core.ShowingDTO
import se.filmstund.domain.id.Base64ID
import se.filmstund.domain.id.MovieID
import se.filmstund.domain.id.ShowingID
import se.filmstund.domain.id.UserID
import java.time.LocalDate

interface ShowingDao {
  companion object {
    private const val SELECTABLE_FIELDS =
      "s.id, s.web_id, s.slug, s.date, s.time, s.movie_id, s.filmstaden_showing_id, s.price, s.tickets_bought, s.admin, s.pay_to_user, s.last_modified_date, s.created_date"
    private const val EXTRA_FIELDS = "la.alias la_alias, cs.id cs_id, cs.name cs_name, COALESCE(m.original_title, m.title) movieTitle, payee.phone payToPhone"
    private const val COMMON_JOINS = "LEFT JOIN location l ON s.location_id = l.name LEFT JOIN location_alias la ON l.name = la.location LEFT JOIN cinema_screen cs ON s.cinema_screen_id = cs.id JOIN movie m on s.movie_id = m.id JOIN users payee ON s.pay_to_user = payee.id"

    private const val STAR = "$SELECTABLE_FIELDS, ${LocationDao.SELECTABLE_FIELDS}, $EXTRA_FIELDS"
  }

  @SqlQuery("SELECT count(*) FROM showing")
  fun count(): Int

  @SqlQuery("SELECT $STAR FROM showing s $COMMON_JOINS WHERE s.id = :showingId")
  @UseRowReducer(ShowingLocationScreenReducer::class)
  @RegisterKotlinMappers(
    RegisterKotlinMapper(LocationDTO::class, "l"),
    RegisterKotlinMapper(CinemaScreenDTO::class, "cs")
  )
  fun findById(showingId: ShowingID): ShowingDTO?

  fun findByIdOrThrow(showingId: ShowingID): ShowingDTO =
    findById(showingId) ?: throw NotFoundException(what = "showing", showingId = showingId)

  @SqlQuery("SELECT $STAR FROM showing s $COMMON_JOINS WHERE s.web_id = :webId")
  @UseRowReducer(ShowingLocationScreenReducer::class)
  @RegisterKotlinMappers(
    RegisterKotlinMapper(LocationDTO::class, "l"),
    RegisterKotlinMapper(CinemaScreenDTO::class, "cs")
  )
  fun findByWebId(webId: Base64ID): ShowingDTO?

  @SqlQuery("SELECT $STAR FROM showing s $COMMON_JOINS WHERE s.admin = :userId OR s.id IN (SELECT a.showing_id FROM attendee a WHERE a.user_id = :userId)")
  @UseRowReducer(ShowingLocationScreenReducer::class)
  @RegisterKotlinMappers(
    RegisterKotlinMapper(LocationDTO::class, "l"),
    RegisterKotlinMapper(CinemaScreenDTO::class, "cs")
  )
  fun findByAdminOrAttendee(userId: UserID): List<ShowingDTO>

  @SqlQuery("SELECT $STAR FROM showing s $COMMON_JOINS WHERE s.movie_id = :movieId ORDER BY date DESC")
  @UseRowReducer(ShowingLocationScreenReducer::class)
  @RegisterKotlinMappers(
    RegisterKotlinMapper(LocationDTO::class, "l"),
    RegisterKotlinMapper(CinemaScreenDTO::class, "cs")
  )
  fun findByMovieIdOrderByDateDesc(movieId: MovieID): List<ShowingDTO>

  @SqlQuery("SELECT $STAR FROM showing s $COMMON_JOINS WHERE s.date > :afterDate ORDER BY date DESC")
  @UseRowReducer(ShowingLocationScreenReducer::class)
  @RegisterKotlinMappers(
    RegisterKotlinMapper(LocationDTO::class, "l"),
    RegisterKotlinMapper(CinemaScreenDTO::class, "cs")
  )
  fun findByDateAfterOrderByDateDesc(afterDate: LocalDate): List<ShowingDTO>

  @SqlQuery("SELECT exists(SELECT 1 FROM showing s  WHERE s.admin = :adminUserId AND s.id = :showingId)")
  fun isAdminOnShowing(adminUserId: UserID, showingId: ShowingID): Boolean

  @Timestamped
  @SqlUpdate("UPDATE showing s SET admin = :newAdmin, pay_to_user = :newAdmin, last_modified_date = :now WHERE s.id = :showingId and s.admin = :currentAdmin")
  fun promoteNewUserToAdmin(showingId: ShowingID, currentAdmin: UserID, newAdmin: UserID): Boolean

  @Suppress("SqlResolve")
  @SqlUpdate("INSERT INTO showing(id, web_id, slug, date, time, movie_id, location_id, cinema_screen_id, filmstaden_showing_id, price, tickets_bought, admin, pay_to_user) values (:id, :webId, :slug, :date, :time, :movieId, :location?.name, :cinemaScreen?.id, :filmstadenShowingId, :price, :ticketsBought, :admin, :payToUser)")
  fun insertNewShowing(@BindBean showing: ShowingDTO)

  @SqlUpdate("INSERT INTO cinema_screen (id, name) VALUES (:id, :name) ON CONFLICT DO NOTHING")
  fun maybeInsertCinemaScreen(@BindBean cinemaScreen: CinemaScreenDTO): Int

  fun insertShowingAndCinemaScreen(showing: ShowingDTO) {
    showing.cinemaScreen?.let { maybeInsertCinemaScreen(it) }
    insertNewShowing(showing)
  }

  @SqlUpdate("DELETE FROM showing s WHERE s.id = :showingId AND s.admin = :admin")
  fun deleteByShowingAndAdmin(showingId: ShowingID, admin: UserID): Boolean

  @Timestamped
  @SqlUpdate("UPDATE showing s SET tickets_bought = true, price = :price, last_modified_date = :now WHERE s.id = :showingId AND s.tickets_bought = false AND s.admin = :adminUserId")
  fun markShowingAsBought(showingId: ShowingID, adminUserId: UserID, price: SEK): Boolean

  @Suppress("SqlResolve")
  @Timestamped
  @SqlUpdate("UPDATE showing s SET price = :price, pay_to_user = :payToUser, location_id = :location?.name, filmstaden_showing_id = :filmstadenShowingId, cinema_screen_id = :cinemaScreen?.id, date = :date, time = :time, last_modified_date = :now WHERE s.id = :id AND s.admin = :admin")
  fun updateShowing(@BindBean updatedShowing: ShowingDTO, admin: UserID): Boolean
}