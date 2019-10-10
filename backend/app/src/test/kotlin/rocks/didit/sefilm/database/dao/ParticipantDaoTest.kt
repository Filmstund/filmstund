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
import rocks.didit.sefilm.nextGiftCerts
import rocks.didit.sefilm.nextMovie
import rocks.didit.sefilm.nextParticipant
import rocks.didit.sefilm.nextShowing
import rocks.didit.sefilm.nextUserDTO
import java.util.*
import java.util.concurrent.ThreadLocalRandom

@ExtendWith(SpringExtension::class)
@SpringBootTest(classes = [Jdbi::class])
@Import(TestConfig::class, DbConfig::class)
internal class ParticipantDaoTest {
  @Autowired
  private lateinit var jdbi: Jdbi

  private val rnd: ThreadLocalRandom = ThreadLocalRandom.current()

  @Test
  internal fun `given a showing with participants, when findAllParticipants(), then all participants are returned`() {
    val rndMovie = rnd.nextMovie()
    val rndAdmin = rnd.nextUserDTO()
    val rndUsers = (1..10).map {
      val userId = UUID.randomUUID()
      rnd.nextUserDTO(id = userId, giftCerts = rnd.nextGiftCerts(userId, 2))
    }
    val rndShowing = rnd.nextShowing(rndMovie.id, rndAdmin.id)
    val rndParticipants = rndUsers.map { u ->
      val ticketNumber = if (rnd.nextLong(0, 100) < 50) u.giftCertificates.first().number else null
      rnd.nextParticipant(u.id, rndShowing.id, ticketNumber)
    }

    jdbi.useTransactionUnchecked { handle ->
      val userDao = handle.attach(UserDao::class.java)
      val movieDao = handle.attach(MovieDao::class.java)
      val locationDao = handle.attach(LocationDao::class.java)
      val showingDao = handle.attach(ShowingDao::class.java)
      val participantDao = handle.attach(ParticipantDao::class.java)

      userDao.insertUser(rndAdmin)
      rndUsers.forEach { u -> userDao.insertUserAndGiftCerts(u) }
      movieDao.insertMovie(rndMovie)
      locationDao.insertLocationAndAlias(rndShowing.location!!)
      showingDao.insertShowingAndCinemaScreen(rndShowing)
      participantDao.insertParticipantsOnShowing(rndParticipants)

      val allParticipants = participantDao.findAllParticipants(rndShowing.id)
      assertThat(allParticipants)
        .hasSameSizeAs(rndParticipants)
      allParticipants.forEachIndexed { index, p ->
        assertThat(p)
          .isEqualToIgnoringGivenFields(
            rndParticipants[index],
            "userInfo",
            "filmstadenMembershipId",
            "giftCertificateUsed"
          )
        if (p.giftCertificateUsed != null) {
          assertThat(p.giftCertificateUsed)
            .isEqualToIgnoringGivenFields(rndParticipants[index].giftCertificateUsed, "expiresAt")
        } else {
          assertThat(rndParticipants[index].giftCertificateUsed)
            .isNull()
        }
      }
    }
  }

  @Test
  internal fun `given no participants on a showing, when isParticipantOnShowing(), then false is returned`() {
    val rndMovie = rnd.nextMovie()
    val rndAdmin = rnd.nextUserDTO()
    val rndUser = rnd.nextUserDTO()
    val rndShowing = rnd.nextShowing(rndMovie.id, rndAdmin.id)

    jdbi.useTransactionUnchecked { handle ->
      val userDao = handle.attach(UserDao::class.java)
      val movieDao = handle.attach(MovieDao::class.java)
      val locationDao = handle.attach(LocationDao::class.java)
      val showingDao = handle.attach(ShowingDao::class.java)
      val participantDao = handle.attach(ParticipantDao::class.java)

      userDao.insertUser(rndAdmin)
      userDao.insertUser(rndUser)
      movieDao.insertMovie(rndMovie)
      locationDao.insertLocationAndAlias(rndShowing.location!!)
      showingDao.insertShowingAndCinemaScreen(rndShowing)

      assertThat(participantDao.isParticipantOnShowing(rndAdmin.id, rndShowing.id))
        .describedAs("Showing admin is participant")
        .isFalse()
      assertThat(participantDao.isParticipantOnShowing(rndUser.id, rndShowing.id))
        .describedAs("Random user is participant")
        .isFalse()
    }
  }

  @Test
  internal fun `given participants on a showing, when isParticipantOnShowing(), then true is returned`() {
    val rndMovie = rnd.nextMovie()
    val rndAdmin = rnd.nextUserDTO()
    val rndUser = rnd.nextUserDTO()
    val rndShowing = rnd.nextShowing(rndMovie.id, rndAdmin.id)

    jdbi.useTransactionUnchecked { handle ->
      val userDao = handle.attach(UserDao::class.java)
      val movieDao = handle.attach(MovieDao::class.java)
      val locationDao = handle.attach(LocationDao::class.java)
      val showingDao = handle.attach(ShowingDao::class.java)
      val participantDao = handle.attach(ParticipantDao::class.java)

      userDao.insertUser(rndAdmin)
      userDao.insertUser(rndUser)
      movieDao.insertMovie(rndMovie)
      locationDao.insertLocationAndAlias(rndShowing.location!!)
      showingDao.insertShowingAndCinemaScreen(rndShowing)

      val participant = rnd.nextParticipant(rndUser.id, rndShowing.id)
      participantDao.insertParticipantOnShowing(participant)

      assertThat(participantDao.isParticipantOnShowing(rndAdmin.id, rndShowing.id))
        .describedAs("Showing admin is participant")
        .isFalse()
      assertThat(participantDao.isParticipantOnShowing(rndUser.id, rndShowing.id))
        .describedAs("Random user is participant")
        .isTrue()
    }
  }
}