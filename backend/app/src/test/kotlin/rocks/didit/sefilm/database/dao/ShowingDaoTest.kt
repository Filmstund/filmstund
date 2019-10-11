package rocks.didit.sefilm.database.dao

import org.assertj.core.api.Assertions.assertThat
import org.jdbi.v3.core.Jdbi
import org.jdbi.v3.core.kotlin.useTransactionUnchecked
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.junit.jupiter.SpringExtension
import rocks.didit.sefilm.TestConfig
import rocks.didit.sefilm.database.DbConfig
import rocks.didit.sefilm.domain.dto.PublicUserDTO
import rocks.didit.sefilm.domain.dto.core.ParticipantDTO
import rocks.didit.sefilm.nextMovie
import rocks.didit.sefilm.nextShowing
import rocks.didit.sefilm.nextUserDTO
import java.util.concurrent.ThreadLocalRandom

@ExtendWith(SpringExtension::class)
@SpringBootTest(classes = [Jdbi::class])
@Import(TestConfig::class, DbConfig::class)
internal class ShowingDaoTest {
  @Autowired
  private lateinit var jdbi: Jdbi

  private val rnd: ThreadLocalRandom = ThreadLocalRandom.current()

  @Test
  internal fun `given an existing showing, when findById(), then that showing is returned`() {
    val rndMovie = rnd.nextMovie()
    val rndAdmin = rnd.nextUserDTO()
    val rndShowing = rnd.nextShowing(rndMovie.id, rndAdmin.id)

    jdbi.useTransactionUnchecked { handle ->
      val userDao = handle.attach(UserDao::class.java)
      val movieDao = handle.attach(MovieDao::class.java)
      val locationDao = handle.attach(LocationDao::class.java)
      val showingDao = handle.attach(ShowingDao::class.java)

      userDao.insertUser(rndAdmin)
      movieDao.insertMovie(rndMovie)
      locationDao.insertLocationAndAlias(rndShowing.location!!)
      showingDao.insertShowingAndCinemaScreen(rndShowing)

      val dbShowing = showingDao.findById(rndShowing.id)

      assertThat(dbShowing)
        .isNotNull
        .isEqualToIgnoringGivenFields(rndShowing, "lastModifiedDate", "createdDate", "location")
      assertThat(dbShowing?.location)
        .isNotNull
        .isEqualToIgnoringGivenFields(rndShowing.location, "lastModifiedDate")
    }
  }

  @Test
  internal fun `given a user that is admin on one showing and participant on another, when findByAdminOrParticipant(), then all showings where user is admin or participant on will be returned`() {
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
      val participantDao = handle.attach(ParticipantDao::class.java)

      userDao.insertUserAndGiftCerts(rndAdmin)
      userDao.insertUserAndGiftCerts(rndUser)
      movieDao.insertMovie(rndMovie)
      locationDao.insertLocationAndAlias(rndShowing.location!!)
      locationDao.insertLocationAndAlias(rndShowing2.location!!)
      showingDao.insertShowingAndCinemaScreen(rndShowing)
      showingDao.insertShowingAndCinemaScreen(rndShowing2)
      participantDao.insertParticipantOnShowing(ParticipantDTO(rndAdmin.id, rndShowing2.id, PublicUserDTO(rndAdmin.id)))
      participantDao.insertParticipantOnShowing(ParticipantDTO(rndAdmin.id, rndShowing.id, PublicUserDTO(rndAdmin.id)))

      val dbShowings = showingDao.findByAdminOrParticipant(rndAdmin.id)
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
        .isNotNull()
        .isEqualTo(rndAdmin.id)
      assertThat(dbShowing?.payToUser)
        .isNotNull()
        .isEqualTo(rndAdmin.id)
      assertThat(showingDao.promoteNewUserToAdmin(rndShowing.id, rndAdmin.id, rndNewAdmin.id))
        .isTrue()
      val dbShowingUpdated = showingDao.findById(rndShowing.id)
      assertThat(dbShowingUpdated?.admin)
        .isNotNull()
        .isNotEqualTo(rndAdmin.id)
        .isEqualTo(rndNewAdmin.id)
      assertThat(dbShowingUpdated?.payToUser)
        .isNotNull()
        .isEqualTo(rndNewAdmin.id)
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
}