package rocks.didit.sefilm.services

import org.assertj.core.api.Assertions.assertThat
import org.jdbi.v3.core.Jdbi
import org.jdbi.v3.core.kotlin.useTransactionUnchecked
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.junit.jupiter.SpringExtension
import rocks.didit.sefilm.Properties
import rocks.didit.sefilm.TestConfig
import rocks.didit.sefilm.database.DbConfig
import rocks.didit.sefilm.database.dao.LocationDao
import rocks.didit.sefilm.database.dao.MovieDao
import rocks.didit.sefilm.database.dao.ShowingDao
import rocks.didit.sefilm.database.dao.UserDao
import rocks.didit.sefilm.domain.id.CalendarFeedID
import rocks.didit.sefilm.domain.id.UserID
import rocks.didit.sefilm.nextMovie
import rocks.didit.sefilm.nextShowing
import rocks.didit.sefilm.nextUserDTO
import java.util.concurrent.ThreadLocalRandom

@ExtendWith(SpringExtension::class)
@SpringBootTest(classes = [Jdbi::class, CalendarService::class, Properties::class])
@Import(TestConfig::class, DbConfig::class)
internal class CalendarServiceTest {

  @Autowired
  private lateinit var jdbi: Jdbi
  @Autowired
  private lateinit var calendarService: CalendarService

  private val rnd = ThreadLocalRandom.current()

  companion object {
    private const val expectedCalendarName = "SeFilm"
  }

  @Test
  fun `given no user with calendar feed, when calendar is requested, then a "empty" calendar is returned`() {
    val userFeedId = CalendarFeedID.random()
    val calendar = calendarService.getCalendarFeed(userFeedId)
    assertThat(calendar).isNotNull
    assertThat(calendar.names.size).isEqualTo(1)
    assertThat(calendar.names[0].value).isEqualTo(expectedCalendarName)
    assertThat(calendar.uid.value.toString()).isEqualTo(userFeedId.toString())
    assertThat(calendar.events).hasSize(0)
  }

  @Test
  internal fun `given a user with no showings, when calendar is requested, then a  "empty" calendar is returned`() {
    val userId = UserID.random()
    val rndUser = rnd.nextUserDTO(userId)

    jdbi.useTransactionUnchecked {
      val userDao = it.attach(UserDao::class.java)
      userDao.insertUserAndGiftCerts(rndUser)

      assertThat(rndUser.calendarFeedId)
      val calendar = calendarService.getCalendarFeed(rndUser.calendarFeedId!!)
      assertThat(calendar).isNotNull
      assertThat(calendar.names.size).isEqualTo(1)
      assertThat(calendar.names[0].value).isEqualTo(expectedCalendarName)
      assertThat(calendar.uid.value.toString()).isEqualTo(rndUser.calendarFeedId.toString())
      assertThat(calendar.events).hasSize(0)
    }
  }

  @Test
  internal fun `given a user with showings, when calendar is requested, then a calendar with the showings are returned`() {
    val rndMovie = rnd.nextMovie()
    val rndAdmin = rnd.nextUserDTO()
    val rndShowing = rnd.nextShowing(rndMovie.id, rndAdmin.id)
    val rndShowing2 = rnd.nextShowing(rndMovie.id, rndAdmin.id)

    jdbi.useTransactionUnchecked { handle ->
      val userDao = handle.attach(UserDao::class.java)
      val movieDao = handle.attach(MovieDao::class.java)
      val locationDao = handle.attach(LocationDao::class.java)
      val showingDao = handle.attach(ShowingDao::class.java)

      userDao.insertUserAndGiftCerts(rndAdmin)
      movieDao.insertMovie(rndMovie)
      locationDao.insertLocationAndAlias(rndShowing.location!!)
      locationDao.insertLocationAndAlias(rndShowing2.location!!)
      showingDao.insertShowingAndCinemaScreen(rndShowing)
      showingDao.insertShowingAndCinemaScreen(rndShowing2)

      assertThat(rndAdmin.calendarFeedId).isNotNull()
      val calendar = calendarService.getCalendarFeed(rndAdmin.calendarFeedId!!)
      assertThat(calendar).isNotNull
      assertThat(calendar.events).hasSize(2)
    }
  }
}