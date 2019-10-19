package rocks.didit.sefilm.database.dao

import org.jdbi.v3.sqlobject.config.RegisterKotlinMappers
import org.jdbi.v3.sqlobject.customizer.BindBean
import org.jdbi.v3.sqlobject.customizer.Timestamped
import org.jdbi.v3.sqlobject.kotlin.RegisterKotlinMapper
import org.jdbi.v3.sqlobject.statement.SqlQuery
import org.jdbi.v3.sqlobject.statement.SqlUpdate
import org.jdbi.v3.sqlobject.statement.UseRowReducer
import rocks.didit.sefilm.NotFoundException
import rocks.didit.sefilm.database.ShowingLocationScreenReducer
import rocks.didit.sefilm.domain.SEK
import rocks.didit.sefilm.domain.dto.FilmstadenLiteScreenDTO
import rocks.didit.sefilm.domain.dto.core.LocationDTO
import rocks.didit.sefilm.domain.dto.core.ShowingDTO
import rocks.didit.sefilm.domain.id.Base64ID
import rocks.didit.sefilm.domain.id.MovieID
import rocks.didit.sefilm.domain.id.UserID
import java.time.LocalDate
import java.util.*

interface ShowingDao {
  companion object {
    private const val SELECTABLE_FIELDS =
      "s.id, s.web_id, s.slug, s.date, s.time, s.movie_id, s.filmstaden_showing_id, s.price, s.tickets_bought, s.admin, s.pay_to_user, s.last_modified_date, s.created_date"
    private const val EXTRA_FIELDS = "la.alias la_alias, cs.id cs_filmstadenId, cs.name cs_name, COALESCE(m.original_title, m.title) movieTitle, payee.phone payToPhone"
    private const val COMMON_JOINS = "LEFT JOIN location l ON s.location_id = l.name LEFT JOIN location_alias la ON l.name = la.location LEFT JOIN cinema_screen cs ON s.cinema_screen_id = cs.id JOIN movie m on s.movie_id = m.id JOIN users payee ON s.pay_to_user = payee.id"

    private const val STAR = "$SELECTABLE_FIELDS, ${LocationDao.SELECTABLE_FIELDS}, $EXTRA_FIELDS"
  }

  @SqlQuery("SELECT count(*) FROM showing")
  fun count(): Int

  @SqlQuery("SELECT $STAR FROM showing s $COMMON_JOINS WHERE s.id = :showingId")
  @UseRowReducer(ShowingLocationScreenReducer::class)
  @RegisterKotlinMappers(
    RegisterKotlinMapper(LocationDTO::class, "l"),
    RegisterKotlinMapper(FilmstadenLiteScreenDTO::class, "cs")
  )
  fun findById(showingId: UUID): ShowingDTO?

  fun findByIdOrThrow(showingId: UUID): ShowingDTO =
    findById(showingId) ?: throw NotFoundException(what = "showing", showingId = showingId)

  @SqlQuery("SELECT $STAR FROM showing s $COMMON_JOINS WHERE s.web_id = :webId")
  @UseRowReducer(ShowingLocationScreenReducer::class)
  @RegisterKotlinMappers(
    RegisterKotlinMapper(LocationDTO::class, "l"),
    RegisterKotlinMapper(FilmstadenLiteScreenDTO::class, "cs")
  )
  fun findByWebId(webId: Base64ID): ShowingDTO?

  @SqlQuery("SELECT $STAR FROM showing s $COMMON_JOINS WHERE s.admin = :userId OR s.id IN (SELECT showing_id FROM participant p WHERE p.user_id = :userId)")
  @UseRowReducer(ShowingLocationScreenReducer::class)
  @RegisterKotlinMappers(
    RegisterKotlinMapper(LocationDTO::class, "l"),
    RegisterKotlinMapper(FilmstadenLiteScreenDTO::class, "cs")
  )
  fun findByAdminOrParticipant(userId: UserID): List<ShowingDTO>

  @SqlQuery("SELECT $STAR FROM showing s $COMMON_JOINS WHERE s.movie_id = :movieId ORDER BY date DESC")
  @UseRowReducer(ShowingLocationScreenReducer::class)
  @RegisterKotlinMappers(
    RegisterKotlinMapper(LocationDTO::class, "l"),
    RegisterKotlinMapper(FilmstadenLiteScreenDTO::class, "cs")
  )
  fun findByMovieIdOrderByDateDesc(movieId: MovieID): List<ShowingDTO>

  @SqlQuery("SELECT $STAR FROM showing s $COMMON_JOINS WHERE s.date > :afterDate ORDER BY date DESC")
  @UseRowReducer(ShowingLocationScreenReducer::class)
  @RegisterKotlinMappers(
    RegisterKotlinMapper(LocationDTO::class, "l"),
    RegisterKotlinMapper(FilmstadenLiteScreenDTO::class, "cs")
  )
  fun findByDateAfterOrderByDateDesc(afterDate: LocalDate): List<ShowingDTO>

  @SqlQuery("SELECT exists(SELECT 1 FROM showing s  WHERE s.admin = :adminUserId AND s.id = :showingId)")
  fun isAdminOnShowing(adminUserId: UserID, showingId: UUID): Boolean

  @Timestamped
  @SqlUpdate("UPDATE showing s SET admin = :newAdmin, pay_to_user = :newAdmin, last_modified_date = :now WHERE s.id = :showingId and s.admin = :currentAdmin")
  fun promoteNewUserToAdmin(showingId: UUID, currentAdmin: UserID, newAdmin: UserID): Boolean

  @Suppress("SqlResolve")
  @SqlUpdate("INSERT INTO showing(id, web_id, slug, date, time, movie_id, location_id, cinema_screen_id, filmstaden_showing_id, price, tickets_bought, admin, pay_to_user) values (:id, :webId, :slug, :date, :time, :movieId, :location?.name, :cinemaScreen?.filmstadenId, :filmstadenShowingId, :price, :ticketsBought, :admin, :payToUser)")
  fun insertNewShowing(@BindBean showing: ShowingDTO)

  @SqlUpdate("INSERT INTO cinema_screen (id, name) VALUES (:filmstadenId, :name) ON CONFLICT DO NOTHING")
  fun maybeInsertCinemaScreen(@BindBean cinemaScreen: FilmstadenLiteScreenDTO): Int

  fun insertShowingAndCinemaScreen(showing: ShowingDTO) {
    showing.cinemaScreen?.let { maybeInsertCinemaScreen(it) }
    insertNewShowing(showing)
  }

  // TODO test this
  @SqlUpdate("DELETE FROM showing s WHERE s.id = :showingId AND s.admin = :admin")
  fun deleteByShowingAndAdmin(showingId: UUID, admin: UserID): Boolean

  // TODO test this
  @Timestamped
  @SqlUpdate("UPDATE showing s SET tickets_bought = true, price = :price, last_modified_date = :now WHERE s.id = :showingId AND s.tickets_bought = false")
  fun markShowingAsBought(showingId: UUID, price: SEK): Boolean

  // TODO test this and return updated values
  @Suppress("SqlResolve")
  @Timestamped
  @SqlUpdate("UPDATE showing s SET price = :price, pay_to_user = :payToUser, location_id = :location?.name, filmstaden_showing_id = :filmstadenShowingId, cinema_screen_id = :cinemaScreen?.filmstadenId, date = :date, time = :time, last_modified_date = :now WHERE s.id = :id AND s.admin = :admin")
  fun updateShowing(@BindBean updatedShowing: ShowingDTO, admin: UserID): Boolean
}