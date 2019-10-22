package se.filmstund.database.dao

import org.assertj.core.api.Assertions.assertThat
import org.jdbi.v3.core.Jdbi
import org.jdbi.v3.core.kotlin.useTransactionUnchecked
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.junit.jupiter.SpringExtension
import se.filmstund.DatabaseTest
import se.filmstund.TestConfig
import se.filmstund.database.DbConfig
import se.filmstund.domain.SEK
import se.filmstund.domain.dto.PublicUserDTO
import se.filmstund.domain.dto.core.AttendeeDTO
import se.filmstund.domain.dto.core.CinemaScreenDTO
import se.filmstund.domain.dto.core.LocationDTO
import se.filmstund.domain.dto.core.ShowingDTO
import se.filmstund.domain.id.FilmstadenShowingID
import se.filmstund.domain.id.UserID
import se.filmstund.isRoughlyEqualToShowing
import se.filmstund.nextCinemaScreen
import se.filmstund.nextLocation
import se.filmstund.nextMovie
import se.filmstund.nextShowing
import se.filmstund.nextUserDTO
import java.time.LocalDate
import java.time.LocalTime
import java.util.concurrent.ThreadLocalRandom

@ExtendWith(SpringExtension::class)
@SpringBootTest(classes = [Jdbi::class, DatabaseTest::class])
@Import(TestConfig::class, DbConfig::class)
internal class ShowingDaoTest {
  @Autowired
  private lateinit var jdbi: Jdbi

  @Autowired
  private lateinit var databaseTest: DatabaseTest

  private val rnd: ThreadLocalRandom = ThreadLocalRandom.current()

  @Test
  internal fun `given an existing showing, when findById(), then that showing is returned`() {
    databaseTest.start {
      withShowing()
      afterInsert {
        val dbShowing = it.showingDao.findById(showing.id)

        assertThat(dbShowing)
          .isNotNull
          .isEqualToIgnoringGivenFields(
            showing,
            "lastModifiedDate",
            "createdDate",
            "location",
            "movieTitle",
            "payToPhone"
          )
        assertThat(dbShowing?.location)
          .isNotNull
          .isEqualToIgnoringGivenFields(showing.location, "lastModifiedDate")
        assertThat(dbShowing?.movieTitle)
          .isNotNull()
          .isEqualTo(movie.originalTitle)
        assertThat(dbShowing?.payToPhone)
          .isNotNull
          .isEqualTo(user.phone)
      }
    }
  }

  @Test
  internal fun `given an existing showing, when findByWebId(), then that showing is returned`() {
    databaseTest.start {
      withMovie { it.nextMovie().copy(originalTitle = null) }
      withShowing()
      afterInsert {
        val dbShowing = it.showingDao.findByWebId(showing.webId)

        assertThat(dbShowing)
          .isNotNull
          .isEqualToIgnoringGivenFields(
            showing,
            "lastModifiedDate",
            "createdDate",
            "location",
            "movieTitle",
            "payToPhone"
          )
        assertThat(dbShowing?.location)
          .isNotNull
          .isEqualToIgnoringGivenFields(showing.location, "lastModifiedDate")
        assertThat(dbShowing?.movieTitle)
          .isNotNull()
          .isEqualTo(movie.title)
        assertThat(dbShowing?.payToPhone)
          .isNotNull
          .isEqualTo(user.phone)
      }
    }
  }

  @Test
  internal fun `given multiple showings for the same movie, when findByMovieIdOrderByDateDesc(), then all showings for that movie is retured, sorted by date`() {
    databaseTest.start {
      withMovie()
      withUser()
      withShowings { rnd ->
        (1..5).map { rnd.nextShowing(movie.id, adminId = user.id) }
      }
      afterInsert {
        val dbShowings = it.showingDao.findByMovieIdOrderByDateDesc(movie.id)

        assertThat(dbShowings)
          .isNotNull
          .isSortedAccordingTo(compareByDescending(ShowingDTO::date))
          .size()
          .isGreaterThanOrEqualTo(5)
      }
    }
  }

  @Test
  internal fun `given multiple showings with different dates, when findByDateAfterOrderByDateDesc(), then only showings after the supplied date is returned`() {
    databaseTest.start {
      withMovie()
      withUser()
      withShowings { rnd ->
        (1..5).map { rnd.nextShowing(movie.id, adminId = user.id).copy(date = LocalDate.now().plusDays(it.toLong())) }
      }
      withShowings { rnd ->
        (1..5).map { rnd.nextShowing(movie.id, adminId = user.id).copy(date = LocalDate.now().minusDays(it.toLong())) }
      }
      afterInsert {
        val dbShowings = it.showingDao.findByDateAfterOrderByDateDesc(LocalDate.now())

        assertThat(dbShowings)
          .isNotNull
          .isSortedAccordingTo(compareByDescending(ShowingDTO::date))
          .size()
          .isGreaterThanOrEqualTo(5)
      }
    }
  }

  @Test
  internal fun `given a user that is admin on one showing and attendee on another, when findByAdminOrAttendee(), then all showings where user is admin or attendee on will be returned`() {
    val rndMovie = rnd.nextMovie()
    val rndAdmin = rnd.nextUserDTO()
    val rndUser = rnd.nextUserDTO()
    val rndShowing = rnd.nextShowing(rndMovie.id, rndAdmin.id)
    val rndShowing2 = rnd.nextShowing(rndMovie.id, rndUser.id)

    jdbi.useTransactionUnchecked { handle ->
      val userDao = handle.attach(UserDao::class.java)
      val movieDao = handle.attach(MovieDao::class.java)
      val locationDao = handle.attach(LocationDao::class.java)
      val showingDao = handle.attach(ShowingDao::class.java)
      val attendeeDao = handle.attach(AttendeeDao::class.java)

      userDao.insertUserAndGiftCerts(rndAdmin)
      userDao.insertUserAndGiftCerts(rndUser)
      movieDao.insertMovie(rndMovie)
      locationDao.insertLocationAndAlias(rndShowing.location!!)
      locationDao.insertLocationAndAlias(rndShowing2.location!!)
      showingDao.insertShowingAndCinemaScreen(rndShowing)
      showingDao.insertShowingAndCinemaScreen(rndShowing2)
      attendeeDao.insertAttendeeOnShowing(
        AttendeeDTO(
          rndAdmin.id,
          rndShowing2.id,
          PublicUserDTO(rndAdmin.id)
        )
      )
      attendeeDao.insertAttendeeOnShowing(
        AttendeeDTO(
          rndAdmin.id,
          rndShowing.id,
          PublicUserDTO(rndAdmin.id)
        )
      )

      val dbShowings = showingDao.findByAdminOrAttendee(rndAdmin.id)
      assertThat(dbShowings)
        .isNotNull
        .isNotEmpty
        .hasSize(2)

      assertThat(dbShowings.map { s -> s.id })
        .containsExactlyInAnyOrderElementsOf(listOf(rndShowing.id, rndShowing2.id))
    }
  }

  @Test
  internal fun `given an existing showing, when promoteNewUserToAdmin(), then that new user is the admin, and the old one is not`() {
    val rndMovie = rnd.nextMovie()
    val rndAdmin = rnd.nextUserDTO()
    val rndNewAdmin = rnd.nextUserDTO()
    val rndShowing = rnd.nextShowing(rndMovie.id, rndAdmin.id)

    jdbi.useTransactionUnchecked { handle ->
      val userDao = handle.attach(UserDao::class.java)
      val movieDao = handle.attach(MovieDao::class.java)
      val locationDao = handle.attach(LocationDao::class.java)
      val showingDao = handle.attach(ShowingDao::class.java)

      userDao.insertUserAndGiftCerts(rndAdmin)
      userDao.insertUserAndGiftCerts(rndNewAdmin)
      movieDao.insertMovie(rndMovie)
      locationDao.insertLocationAndAlias(rndShowing.location!!)
      showingDao.insertShowingAndCinemaScreen(rndShowing)

      val dbShowing = showingDao.findById(rndShowing.id)

      assertThat(dbShowing?.admin)
        .isNotNull
        .isEqualTo(rndAdmin.id)
      assertThat(dbShowing?.payToUser)
        .isNotNull
        .isEqualTo(rndAdmin.id)
      assertThat(showingDao.promoteNewUserToAdmin(rndShowing.id, rndAdmin.id, rndNewAdmin.id))
        .isTrue()
      val dbShowingUpdated = showingDao.findById(rndShowing.id)
      assertThat(dbShowingUpdated?.admin)
        .isNotNull
        .isNotEqualTo(rndAdmin.id)
        .isEqualTo(rndNewAdmin.id)
      assertThat(dbShowingUpdated?.payToUser)
        .isNotNull
        .isEqualTo(rndNewAdmin.id)
      assertThat(dbShowingUpdated?.lastModifiedDate)
        .isAfter(rndShowing.lastModifiedDate)
    }
  }

  @Test
  internal fun `given an existing showing, when promoteNewUserToAdmin() with the wrong current admin, then the promotion does not happen`() {
    val rndMovie = rnd.nextMovie()
    val rndAdmin = rnd.nextUserDTO()
    val rndNewAdmin = rnd.nextUserDTO()
    val rndShowing = rnd.nextShowing(rndMovie.id, rndAdmin.id)

    jdbi.useTransactionUnchecked { handle ->
      val userDao = handle.attach(UserDao::class.java)
      val movieDao = handle.attach(MovieDao::class.java)
      val locationDao = handle.attach(LocationDao::class.java)
      val showingDao = handle.attach(ShowingDao::class.java)

      userDao.insertUserAndGiftCerts(rndAdmin)
      userDao.insertUserAndGiftCerts(rndNewAdmin)
      movieDao.insertMovie(rndMovie)
      locationDao.insertLocationAndAlias(rndShowing.location!!)
      showingDao.insertShowingAndCinemaScreen(rndShowing)

      val dbShowing = showingDao.findById(rndShowing.id)

      assertThat(dbShowing?.admin).isNotNull.isEqualTo(rndAdmin.id)
      assertThat(dbShowing?.payToUser).isNotNull.isEqualTo(rndAdmin.id)
      assertThat(showingDao.promoteNewUserToAdmin(rndShowing.id, UserID.random(), rndNewAdmin.id))
        .isFalse()
      val dbShowingUpdated = showingDao.findById(rndShowing.id)
      assertThat(dbShowingUpdated?.admin)
        .isNotNull
        .isNotEqualTo(rndNewAdmin.id)
        .isEqualTo(rndAdmin.id)
      assertThat(dbShowingUpdated?.payToUser)
        .isNotNull
        .isEqualTo(rndAdmin.id)
    }
  }

  @Test
  internal fun `given a showing without a screen, when findBy*, then the cinemaScreen is null`() {
    val rndMovie = rnd.nextMovie()
    val rndAdmin = rnd.nextUserDTO()
    val rndShowing = rnd.nextShowing(rndMovie.id, rndAdmin.id).copy(cinemaScreen = null)

    jdbi.useTransactionUnchecked { handle ->
      val userDao = handle.attach(UserDao::class.java)
      val movieDao = handle.attach(MovieDao::class.java)
      val locationDao = handle.attach(LocationDao::class.java)
      val showingDao = handle.attach(ShowingDao::class.java)

      userDao.insertUserAndGiftCerts(rndAdmin)
      movieDao.insertMovie(rndMovie)
      locationDao.insertLocationAndAlias(rndShowing.location!!)
      showingDao.insertShowingAndCinemaScreen(rndShowing)

      assertThat(rndShowing.cinemaScreen).isNull()
      val dbShowing = showingDao.findById(rndShowing.id)
      assertThat(dbShowing).isNotNull
      assertThat(dbShowing?.cinemaScreen).isNull()
    }
  }

  @Test
  internal fun `given a showing without a location, when findBy*, then the location is null`() {
    val rndMovie = rnd.nextMovie()
    val rndAdmin = rnd.nextUserDTO()
    val rndShowing = rnd.nextShowing(rndMovie.id, rndAdmin.id).copy(location = null)

    jdbi.useTransactionUnchecked { handle ->
      val userDao = handle.attach(UserDao::class.java)
      val movieDao = handle.attach(MovieDao::class.java)
      val showingDao = handle.attach(ShowingDao::class.java)

      userDao.insertUserAndGiftCerts(rndAdmin)
      movieDao.insertMovie(rndMovie)
      showingDao.insertShowingAndCinemaScreen(rndShowing)

      assertThat(rndShowing.location).isNull()
      val dbShowing = showingDao.findById(rndShowing.id)
      assertThat(dbShowing).isNotNull
      assertThat(dbShowing?.location).isNull()
    }
  }

  @Test
  internal fun `given a showing, when deleteByShowingAndAdmin(), then the showing is deleted`() {
    databaseTest.start {
      withAdmin()
      withShowing()
      afterInsert {
        assertThat(it.showingDao.findById(showing.id)).isNotNull
        assertThat(it.showingDao.deleteByShowingAndAdmin(showing.id, admin.id)).isTrue()
        assertThat(it.showingDao.findById(showing.id)).isNull()
      }
    }
  }

  @Test
  internal fun `given a showing, when deleteByShowingAndAdmin() where admin is not correct, then the showing is not deleted`() {
    databaseTest.start {
      withAdmin()
      withShowing()
      afterInsert {
        assertThat(it.showingDao.findById(showing.id)).isNotNull
        assertThat(it.showingDao.deleteByShowingAndAdmin(showing.id, UserID.random())).isFalse()
        assertThat(it.showingDao.findById(showing.id)).isNotNull
      }
    }
  }

  @Test
  internal fun `given showing that hasnt been bought, when markShowingAsBought(), then the showing is bought and the price is set`() {
    databaseTest.start {
      withMovie()
      withAdmin()
      withShowing(ticketsBought = false)
      afterInsert {
        assertThat(showing.ticketsBought).isFalse()
        assertThat(showing.price).isNotEqualTo(SEK(1337))
        assertThat(it.showingDao.markShowingAsBought(showing.id, admin.id, SEK(1337))).isTrue()
        val dbShowing = it.showingDao.findById(showing.id)
        assertThat(dbShowing?.ticketsBought).isTrue()
        assertThat(dbShowing?.price).isEqualTo(SEK(1337))
        assertThat(dbShowing?.lastModifiedDate).isAfter(showing.lastModifiedDate)
      }
    }
  }

  @Test
  internal fun `given showing that has been bought, when markShowingAsBought(), then the showing is not bought`() {
    databaseTest.start {
      withMovie()
      withAdmin()
      withShowing(ticketsBought = true)
      afterInsert {
        assertThat(showing.ticketsBought).isTrue()
        assertThat(showing.price).isNotEqualTo(SEK(1337))
        assertThat(it.showingDao.markShowingAsBought(showing.id, admin.id, SEK(1337))).isFalse()
        val dbShowing = it.showingDao.findById(showing.id)
        assertThat(dbShowing?.ticketsBought).isTrue()
        assertThat(dbShowing?.price).isNotEqualTo(SEK(1337))
      }
    }
  }

  @Test
  internal fun `given showing that hasnt been bought, when markShowingAsBought() but the admin is wrong, then the showing is not bought`() {
    databaseTest.start {
      withMovie()
      withAdmin()
      withShowing(ticketsBought = true)
      afterInsert {
        assertThat(showing.ticketsBought).isTrue()
        assertThat(showing.price).isNotEqualTo(SEK(1337))
        assertThat(it.showingDao.markShowingAsBought(showing.id, UserID.random(), SEK(1337))).isFalse()
        val dbShowing = it.showingDao.findById(showing.id)
        assertThat(dbShowing?.ticketsBought).isTrue()
        assertThat(dbShowing?.price).isNotEqualTo(SEK(1337))
      }
    }
  }

  @Test
  internal fun `given a showing with old values, then updateShowing() with the wrong admin, then no update is done`() {
    databaseTest.start {
      withShowing(ticketsBought = false)
      afterInsert {
        val updatedShowing = showing.copy(price = SEK(1337), date = LocalDate.now().plusDays(120))
        assertThat(it.showingDao.updateShowing(updatedShowing, UserID.random())).isFalse()
        val dbShowing = it.showingDao.findById(showing.id)
        assertThat(dbShowing).isRoughlyEqualToShowing(showing)
      }
    }
  }

  @Test
  internal fun `given a showing with old values, then updateShowing(), then the update is done`() {
    databaseTest.start {
      withAdmin()
      withShowing(ticketsBought = false)
      withUser()
      afterInsert {
        val rndNewLocation = tlrnd.nextLocation()
        it.locationDao.insertLocationAndAlias(rndNewLocation)
        val rndNewCinemaScreen =tlrnd.nextCinemaScreen()
        it.showingDao.maybeInsertCinemaScreen(rndNewCinemaScreen)

        val dbShowingBefore = it.showingDao.findById(showing.id)
        val updatedShowing = showing.copy(
          price = SEK(1337),
          payToUser = user.id,
          location = rndNewLocation,
          filmstadenShowingId = FilmstadenShowingID("HEJHOPP"),
          cinemaScreen = rndNewCinemaScreen,
          date = LocalDate.now().plusDays(120),
          time = LocalTime.NOON
          )
        assertThat(it.showingDao.updateShowing(updatedShowing, admin.id)).isTrue()

        val dbShowingAfter = it.showingDao.findById(showing.id)
        assertThat(dbShowingBefore).isRoughlyEqualToShowing(showing)
        assertThat(dbShowingAfter).isRoughlyEqualToShowing(updatedShowing)
        assertThat(dbShowingAfter?.lastModifiedDate).isNotNull().isAfter(dbShowingBefore?.lastModifiedDate)

        assertThat(dbShowingAfter?.price).isEqualTo(SEK(1337))
        assertThat(dbShowingAfter?.payToUser).isEqualTo(user.id)
        assertThat(dbShowingAfter?.location).isEqualToIgnoringGivenFields(rndNewLocation, "lastModifiedDate")
        assertThat(dbShowingAfter?.filmstadenShowingId).isEqualTo(FilmstadenShowingID("HEJHOPP"))
        assertThat(dbShowingAfter?.cinemaScreen).isEqualTo(rndNewCinemaScreen)
        assertThat(dbShowingAfter?.date).isEqualTo(LocalDate.now().plusDays(120))
        assertThat(dbShowingAfter?.time).isEqualTo(LocalTime.NOON)
      }
    }
  }
}