package rocks.didit.sefilm.services

import org.assertj.core.api.Assertions.assertThat
import org.jdbi.v3.core.Jdbi
import org.jdbi.v3.core.kotlin.useTransactionUnchecked
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.security.access.AccessDeniedException
import org.springframework.test.context.junit.jupiter.SpringExtension
import rocks.didit.sefilm.TestConfig
import rocks.didit.sefilm.WithLoggedInUser
import rocks.didit.sefilm.currentLoggedInUser
import rocks.didit.sefilm.database.DbConfig
import rocks.didit.sefilm.database.dao.LocationDao
import rocks.didit.sefilm.database.dao.MovieDao
import rocks.didit.sefilm.database.dao.ShowingDao
import rocks.didit.sefilm.database.dao.UserDao
import rocks.didit.sefilm.nextMovie
import rocks.didit.sefilm.nextShowing
import rocks.didit.sefilm.nextUserDTO
import java.util.*
import java.util.concurrent.ThreadLocalRandom

@ExtendWith(SpringExtension::class)
@SpringBootTest(classes = [Jdbi::class, AdminService::class])
@Import(TestConfig::class, DbConfig::class)
internal class AdminServiceTest {

  @Autowired
  private lateinit var jdbi: Jdbi

  @Autowired
  private lateinit var adminService: AdminService

  private val rnd: ThreadLocalRandom = ThreadLocalRandom.current()

  @Test
  @WithLoggedInUser
  internal fun `given no showing, when promoteToAdmin(), then an AccessDeniedException is thrown`() {
    val rndNewAdmin = rnd.nextUserDTO()
    jdbi.useTransactionUnchecked { handle ->
      val userDao = handle.attach(UserDao::class.java)
      userDao.insertUserAndGiftCerts(rndNewAdmin)

      val e = assertThrows<AccessDeniedException> {
        adminService.promoteToAdmin(UUID.randomUUID(), rndNewAdmin.id)
      }
      assertThat(e.message)
        .isNotNull()
        .isEqualTo("Only the showing admin is allowed to do that")
    }
  }

  @Test
  @WithLoggedInUser
  internal fun `given a showing, when promoteToAdmin(), then the new admin is correctly promoted`() {
    val currentUserId = currentLoggedInUser().id
    val rndMovie = rnd.nextMovie()
    val rndNewAdmin = rnd.nextUserDTO()
    val rndShowing = rnd.nextShowing(rndMovie.id, currentUserId)

    jdbi.useTransactionUnchecked { handle ->
      val userDao = handle.attach(UserDao::class.java)
      val movieDao = handle.attach(MovieDao::class.java)
      val locationDao = handle.attach(LocationDao::class.java)
      val showingDao = handle.attach(ShowingDao::class.java)

      userDao.insertUserAndGiftCerts(rndNewAdmin)
      movieDao.insertMovie(rndMovie)
      locationDao.insertLocationAndAlias(rndShowing.location!!)
      showingDao.insertShowingAndCinemaScreen(rndShowing)

      val dbShowing = showingDao.findById(rndShowing.id)

      assertThat(dbShowing?.admin).isNotNull().isEqualTo(currentUserId)
      assertThat(dbShowing?.payToUser).isNotNull().isEqualTo(currentUserId)


      val dbShowingUpdated = adminService.promoteToAdmin(rndShowing.id, rndNewAdmin.id)
      assertThat(dbShowingUpdated.admin)
        .isNotEqualTo(currentUserId)
        .isEqualTo(rndNewAdmin.id)
      assertThat(dbShowingUpdated.payToUser)
        .isEqualTo(rndNewAdmin.id)
      assertThat(dbShowingUpdated.lastModifiedDate)
        .isAfter(rndShowing.lastModifiedDate)
    }
  }

  @Test
  @WithLoggedInUser
  internal fun `given a showing, when promoteToAdmin() with the wrong current user, then an AccessDeniedException is thrown`() {
    val rndMovie = rnd.nextMovie()
    val rndAdmin = rnd.nextUserDTO()
    val rndNewAdmin = rnd.nextUserDTO()
    val rndShowing = rnd.nextShowing(rndMovie.id, rndAdmin.id)

    jdbi.useTransactionUnchecked { handle ->
      val userDao = handle.attach(UserDao::class.java)
      val movieDao = handle.attach(MovieDao::class.java)
      val locationDao = handle.attach(LocationDao::class.java)
      val showingDao = handle.attach(ShowingDao::class.java)

      userDao.insertUserAndGiftCerts(rndNewAdmin)
      userDao.insertUserAndGiftCerts(rndAdmin)
      movieDao.insertMovie(rndMovie)
      locationDao.insertLocationAndAlias(rndShowing.location!!)
      showingDao.insertShowingAndCinemaScreen(rndShowing)

      val dbShowing = showingDao.findById(rndShowing.id)

      assertThat(dbShowing?.admin).isNotNull().isEqualTo(rndAdmin.id)
      assertThat(dbShowing?.payToUser).isNotNull().isEqualTo(rndAdmin.id)


      assertThrows<AccessDeniedException> {
        adminService.promoteToAdmin(rndShowing.id, rndNewAdmin.id)
      }
    }
  }
}