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
import rocks.didit.sefilm.DatabaseTest
import rocks.didit.sefilm.TestConfig
import rocks.didit.sefilm.database.DbConfig
import rocks.didit.sefilm.domain.SEK
import rocks.didit.sefilm.domain.dto.core.ParticipantDTO
import rocks.didit.sefilm.nextGiftCerts
import rocks.didit.sefilm.nextMovie
import rocks.didit.sefilm.nextParticipant
import rocks.didit.sefilm.nextShowing
import rocks.didit.sefilm.nextUserDTO
import java.util.*
import java.util.concurrent.ThreadLocalRandom

@ExtendWith(SpringExtension::class)
@SpringBootTest(classes = [Jdbi::class, DatabaseTest::class])
@Import(TestConfig::class, DbConfig::class)
internal class ParticipantDaoTest {
  @Autowired
  private lateinit var jdbi: Jdbi

  @Autowired
  private lateinit var databaseTest: DatabaseTest

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
    databaseTest.start {
      withAdmin()
      withShowing()
      withUser()
      afterInsert {
        assertThat(it.participantDao.isParticipantOnShowing(admin.id, showing.id))
          .describedAs("Showing admin is participant")
          .isFalse()
        assertThat(it.participantDao.isParticipantOnShowing(user.id, showing.id))
          .describedAs("Random user is participant")
          .isFalse()
      }
    }
  }

  @Test
  internal fun `given participants on a showing, when isParticipantOnShowing(), then true is returned`() {
    databaseTest.start {
      withAdmin()
      withShowing()
      withParticipantOnLastShowing()
      afterInsert {
        assertThat(it.participantDao.isParticipantOnShowing(admin.id, showing.id))
          .describedAs("Showing admin is participant")
          .isFalse()
        assertThat(it.participantDao.isParticipantOnShowing(user.id, showing.id))
          .describedAs("Random user is participant")
          .isTrue()
      }
    }
  }

  @Test
  internal fun `given a showing with participants, when updatePaymentInfo(), then only the relevant participant is updated`() {
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
      val firstParticipant =
        allParticipants.find { it.userId == rndParticipants.first().userId && it.showingId == rndParticipants.first().showingId }

      val updatedParticipant = participantDao.updatePaymentStatus(
        firstParticipant?.userId!!,
        firstParticipant.showingId,
        rndAdmin.id,
        true,
        SEK(1337)
      )
      assertThat(updatedParticipant)
        .isNotNull
        .isEqualToIgnoringGivenFields(firstParticipant, "hasPaid", "amountOwed")
      assertThat(updatedParticipant?.hasPaid)
        .describedAs("has paid")
        .isTrue()
      assertThat(updatedParticipant?.amountOwed)
        .describedAs("amount owed")
        .isEqualTo(SEK(1337))
    }
  }

  @Test
  internal fun `given a showing with participants, when updatePaymentInfo() with a random admin, then null is returned`() {
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

      val firstParticipant = rndParticipants.first()

      val updatedParticipant = participantDao.updatePaymentStatus(
        firstParticipant.userId,
        firstParticipant.showingId,
        UUID.randomUUID(),
        true,
        SEK(1337)
      )
      assertThat(updatedParticipant)
        .isNull()

      val firstParticipantFromDb = participantDao.findAllParticipants(rndShowing.id)
        .find { it.userId == firstParticipant.userId && it.showingId == firstParticipant.showingId }
      assertThat(firstParticipantFromDb?.hasPaid)
        .describedAs("has paid")
        .isEqualTo(firstParticipant.hasPaid)
      assertThat(firstParticipantFromDb?.amountOwed)
        .describedAs("amount owed")
        .isEqualTo(firstParticipant.amountOwed)
    }
  }

  @Test
  internal fun `given a showing with participants, when updatePaymentInfo() where amountOwed is null, then amountOwed is not updated`() {
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
      val firstParticipant =
        allParticipants.find { it.userId == rndParticipants.first().userId && it.showingId == rndParticipants.first().showingId }

      val updatedParticipant = participantDao.updatePaymentStatus(
        firstParticipant?.userId!!,
        firstParticipant.showingId,
        rndAdmin.id,
        true,
        null
      )
      assertThat(updatedParticipant)
        .isNotNull
        .isEqualToIgnoringGivenFields(firstParticipant, "hasPaid")
      assertThat(updatedParticipant?.hasPaid)
        .describedAs("has paid")
        .isTrue()
      assertThat(updatedParticipant?.amountOwed)
        .describedAs("amount owed")
        .isNotNull
        .isEqualTo(firstParticipant.amountOwed)
    }
  }

  @Test
  internal fun `given a list of participants, when updateAmountOwedForSwishParticipants, then only swish participants are updated`() {
    databaseTest.start {
      withShowing()
      withParticipantsAndUsers(20) {
        val userId = UUID.randomUUID()
        val user = it.nextUserDTO(userId, it.nextGiftCerts(userId, 1))
        val participant =
          it.nextParticipant(userId, showing.id, user.giftCertificates.first().number).copy(hasPaid = it.nextBoolean())
        Pair(user, participant)
      }
      withParticipantsAndUsers(5) {
        val user = it.nextUserDTO(UUID.randomUUID(), listOf())
        val participant = it.nextParticipant(user.id, showing.id).copy(hasPaid = false)
        Pair(user, participant)
      }
      afterInsert {
        it.participantDao.updateAmountOwedForSwishParticipants(showing.id, showing.admin, SEK(1337))

        val dbParticipants = it.participantDao.findAllParticipants(showing.id)
        assertThat(dbParticipants).hasSize(25)
        dbParticipants.forEach { p->
          if (p.hasPaid || p.type == ParticipantDTO.Type.GIFT_CERTIFICATE) {
            assertThat(p.amountOwed).isNotEqualTo(SEK(1337))
          } else {
            assertThat(p.amountOwed).isEqualTo(SEK(1337))
            // TODO: check last modified date
          }
        }
      }
    }
  }
}