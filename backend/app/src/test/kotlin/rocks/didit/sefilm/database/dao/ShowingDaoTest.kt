package rocks.didit.sefilm.database.dao

import org.assertj.core.api.Assertions.assertThat
import org.jdbi.v3.core.Jdbi
import org.jdbi.v3.core.kotlin.useTransactionUnchecked
import org.junit.jupiter.api.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.junit4.SpringRunner
import rocks.didit.sefilm.TestConfig
import rocks.didit.sefilm.database.DbConfig
import rocks.didit.sefilm.nextMovie
import rocks.didit.sefilm.nextShowing
import rocks.didit.sefilm.nextUserDTO
import java.util.concurrent.ThreadLocalRandom

@RunWith(SpringRunner::class)
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
      locationDao.insertLocationAndAlias(rndShowing.location)
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
}