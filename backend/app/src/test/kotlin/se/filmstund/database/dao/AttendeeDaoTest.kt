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
import se.filmstund.domain.dto.core.AttendeeDTO
import se.filmstund.domain.id.UserID
import se.filmstund.nextAttendee
import se.filmstund.nextGiftCerts
import se.filmstund.nextMovie
import se.filmstund.nextShowing
import se.filmstund.nextUserDTO
import java.util.concurrent.ThreadLocalRandom

@ExtendWith(SpringExtension::class)
@SpringBootTest(classes = [Jdbi::class, DatabaseTest::class])
@Import(TestConfig::class, DbConfig::class)
internal class AttendeeDaoTest {
  @Autowired
  private lateinit var jdbi: Jdbi

  @Autowired
  private lateinit var databaseTest: DatabaseTest

  private val rnd: ThreadLocalRandom = ThreadLocalRandom.current()

  @Test
  internal fun `given a showing with attendees, when findAllAttendees(), then all attendees are returned`() {
    val rndMovie = rnd.nextMovie()
    val rndAdmin = rnd.nextUserDTO()
    val rndUsers = (1..10).map {
      val userId = UserID.random()
      rnd.nextUserDTO(id = userId, giftCerts = rnd.nextGiftCerts(userId, 2))
    }
    val rndShowing = rnd.nextShowing(rndMovie.id, rndAdmin.id)
    val rndAttendees = rndUsers.map { u ->
      val ticketNumber = if (rnd.nextLong(0, 100) < 50) u.giftCertificates.first().number else null
      rnd.nextAttendee(u.id, rndShowing.id, ticketNumber)
    }

    jdbi.useTransactionUnchecked { handle ->
      val userDao = handle.attach(UserDao::class.java)
      val movieDao = handle.attach(MovieDao::class.java)
      val locationDao = handle.attach(LocationDao::class.java)
      val showingDao = handle.attach(ShowingDao::class.java)
      val attendeeDao = handle.attach(AttendeeDao::class.java)

      userDao.insertUser(rndAdmin)
      rndUsers.forEach { u -> userDao.insertUserAndGiftCerts(u) }
      movieDao.insertMovie(rndMovie)
      locationDao.insertLocationAndAlias(rndShowing.location!!)
      showingDao.insertShowingAndCinemaScreen(rndShowing)
      attendeeDao.insertAttendeeOnShowing(rndAttendees)

      val allAttendees = attendeeDao.findAllAttendees(rndShowing.id)
      assertThat(allAttendees)
        .hasSameSizeAs(rndAttendees)
      allAttendees.forEachIndexed { index, p ->
        assertThat(p)
          .isEqualToIgnoringGivenFields(
            rndAttendees[index],
            "userInfo",
            "filmstadenMembershipId",
            "giftCertificateUsed"
          )
        if (p.giftCertificateUsed != null) {
          assertThat(p.giftCertificateUsed)
            .isEqualToIgnoringGivenFields(rndAttendees[index].giftCertificateUsed, "expiresAt")
        } else {
          assertThat(rndAttendees[index].giftCertificateUsed)
            .isNull()
        }
      }
    }
  }

  @Test
  internal fun `given no attendees on a showing, when isAttendeeOnShowing(), then false is returned`() {
    databaseTest.start {
      withAdmin()
      withShowing()
      withUser()
      afterInsert {
        assertThat(it.attendeeDao.isAttendeeOnShowing(admin.id, showing.id))
          .describedAs("Showing admin is attendee")
          .isFalse()
        assertThat(it.attendeeDao.isAttendeeOnShowing(user.id, showing.id))
          .describedAs("Random user is attendee")
          .isFalse()
      }
    }
  }

  @Test
  internal fun `given attendees on a showing, when isAttendeeOnShowing(), then true is returned`() {
    databaseTest.start {
      withAdmin()
      withShowing()
      withAttendeesOnLastShowing()
      afterInsert {
        assertThat(it.attendeeDao.isAttendeeOnShowing(admin.id, showing.id))
          .describedAs("Showing admin is attendee")
          .isFalse()
        assertThat(it.attendeeDao.isAttendeeOnShowing(user.id, showing.id))
          .describedAs("Random user is attendee")
          .isTrue()
      }
    }
  }

  @Test
  internal fun `given a showing with attendees, when updatePaymentInfo(), then only the relevant attendee is updated`() {
    val rndMovie = rnd.nextMovie()
    val rndAdmin = rnd.nextUserDTO()
    val rndUsers = (1..10).map {
      val userId = UserID.random()
      rnd.nextUserDTO(id = userId, giftCerts = rnd.nextGiftCerts(userId, 2))
    }
    val rndShowing = rnd.nextShowing(rndMovie.id, rndAdmin.id)
    val rndAttendees = rndUsers.map { u ->
      val ticketNumber = if (rnd.nextLong(0, 100) < 50) u.giftCertificates.first().number else null
      rnd.nextAttendee(u.id, rndShowing.id, ticketNumber)
    }

    jdbi.useTransactionUnchecked { handle ->
      val userDao = handle.attach(UserDao::class.java)
      val movieDao = handle.attach(MovieDao::class.java)
      val locationDao = handle.attach(LocationDao::class.java)
      val showingDao = handle.attach(ShowingDao::class.java)
      val attendeeDao = handle.attach(AttendeeDao::class.java)

      userDao.insertUser(rndAdmin)
      rndUsers.forEach { u -> userDao.insertUserAndGiftCerts(u) }
      movieDao.insertMovie(rndMovie)
      locationDao.insertLocationAndAlias(rndShowing.location!!)
      showingDao.insertShowingAndCinemaScreen(rndShowing)
      attendeeDao.insertAttendeeOnShowing(rndAttendees)

      val allAttendees = attendeeDao.findAllAttendees(rndShowing.id)
      val firstAttendee =
        allAttendees.find { it.userId == rndAttendees.first().userId && it.showingId == rndAttendees.first().showingId }

      val updatedAttendee = attendeeDao.updatePaymentStatus(
        firstAttendee?.userId!!,
        firstAttendee.showingId,
        rndAdmin.id,
        true,
        SEK(1337)
      )
      assertThat(updatedAttendee)
        .isNotNull
        .isEqualToIgnoringGivenFields(firstAttendee, "hasPaid", "amountOwed")
      assertThat(updatedAttendee?.hasPaid)
        .describedAs("has paid")
        .isTrue()
      assertThat(updatedAttendee?.amountOwed)
        .describedAs("amount owed")
        .isEqualTo(SEK(1337))
    }
  }

  @Test
  internal fun `given a showing with attendees, when updatePaymentInfo() with a random admin, then null is returned`() {
    val rndMovie = rnd.nextMovie()
    val rndAdmin = rnd.nextUserDTO()
    val rndUsers = (1..10).map {
      val userId = UserID.random()
      rnd.nextUserDTO(id = userId, giftCerts = rnd.nextGiftCerts(userId, 2))
    }
    val rndShowing = rnd.nextShowing(rndMovie.id, rndAdmin.id)
    val rndAttendees = rndUsers.map { u ->
      val ticketNumber = if (rnd.nextLong(0, 100) < 50) u.giftCertificates.first().number else null
      rnd.nextAttendee(u.id, rndShowing.id, ticketNumber)
    }

    jdbi.useTransactionUnchecked { handle ->
      val userDao = handle.attach(UserDao::class.java)
      val movieDao = handle.attach(MovieDao::class.java)
      val locationDao = handle.attach(LocationDao::class.java)
      val showingDao = handle.attach(ShowingDao::class.java)
      val attendeeDao = handle.attach(AttendeeDao::class.java)

      userDao.insertUser(rndAdmin)
      rndUsers.forEach { u -> userDao.insertUserAndGiftCerts(u) }
      movieDao.insertMovie(rndMovie)
      locationDao.insertLocationAndAlias(rndShowing.location!!)
      showingDao.insertShowingAndCinemaScreen(rndShowing)
      attendeeDao.insertAttendeeOnShowing(rndAttendees)

      val firstAttendee = rndAttendees.first()

      val updatedAttendee = attendeeDao.updatePaymentStatus(
        firstAttendee.userId,
        firstAttendee.showingId,
        UserID.random(),
        true,
        SEK(1337)
      )
      assertThat(updatedAttendee)
        .isNull()

      val firstAttendeeFromDb = attendeeDao.findAllAttendees(rndShowing.id)
        .find { it.userId == firstAttendee.userId && it.showingId == firstAttendee.showingId }
      assertThat(firstAttendeeFromDb?.hasPaid)
        .describedAs("has paid")
        .isEqualTo(firstAttendee.hasPaid)
      assertThat(firstAttendeeFromDb?.amountOwed)
        .describedAs("amount owed")
        .isEqualTo(firstAttendee.amountOwed)
    }
  }

  @Test
  internal fun `given a showing with attendees, when updatePaymentInfo() where amountOwed is null, then amountOwed is not updated`() {
    val rndMovie = rnd.nextMovie()
    val rndAdmin = rnd.nextUserDTO()
    val rndUsers = (1..10).map {
      val userId = UserID.random()
      rnd.nextUserDTO(id = userId, giftCerts = rnd.nextGiftCerts(userId, 2))
    }
    val rndShowing = rnd.nextShowing(rndMovie.id, rndAdmin.id)
    val rndAttendees = rndUsers.map { u ->
      val ticketNumber = if (rnd.nextLong(0, 100) < 50) u.giftCertificates.first().number else null
      rnd.nextAttendee(u.id, rndShowing.id, ticketNumber)
    }

    jdbi.useTransactionUnchecked { handle ->
      val userDao = handle.attach(UserDao::class.java)
      val movieDao = handle.attach(MovieDao::class.java)
      val locationDao = handle.attach(LocationDao::class.java)
      val showingDao = handle.attach(ShowingDao::class.java)
      val attendeeDao = handle.attach(AttendeeDao::class.java)

      userDao.insertUser(rndAdmin)
      rndUsers.forEach { u -> userDao.insertUserAndGiftCerts(u) }
      movieDao.insertMovie(rndMovie)
      locationDao.insertLocationAndAlias(rndShowing.location!!)
      showingDao.insertShowingAndCinemaScreen(rndShowing)
      attendeeDao.insertAttendeeOnShowing(rndAttendees)

      val allAttendees = attendeeDao.findAllAttendees(rndShowing.id)
      val firstAttendee =
        allAttendees.find { it.userId == rndAttendees.first().userId && it.showingId == rndAttendees.first().showingId }

      val updatedAttendee = attendeeDao.updatePaymentStatus(
        firstAttendee?.userId!!,
        firstAttendee.showingId,
        rndAdmin.id,
        true,
        null
      )
      assertThat(updatedAttendee)
        .isNotNull
        .isEqualToIgnoringGivenFields(firstAttendee, "hasPaid")
      assertThat(updatedAttendee?.hasPaid)
        .describedAs("has paid")
        .isTrue()
      assertThat(updatedAttendee?.amountOwed)
        .describedAs("amount owed")
        .isNotNull
        .isEqualTo(firstAttendee.amountOwed)
    }
  }

  @Test
  internal fun `given a list of attendees, when updateAmountOwedForSwishAttendees, then only swish attendees are updated`() {
    databaseTest.start {
      withShowing()
      withAttendeesAndUsers(20) {
        val userId = UserID.random()
        val user = it.nextUserDTO(userId, it.nextGiftCerts(userId, 1))
        val attendee =
          it.nextAttendee(userId, showing.id, user.giftCertificates.first().number).copy(hasPaid = it.nextBoolean())
        Pair(user, attendee)
      }
      withAttendeesAndUsers(5) {
        val user = it.nextUserDTO(UserID.random(), listOf())
        val attendee = it.nextAttendee(user.id, showing.id).copy(hasPaid = false)
        Pair(user, attendee)
      }
      afterInsert {
        it.attendeeDao.updateAmountOwedForSwishAttendees(showing.id, showing.admin, SEK(1337))

        val dbAttendees = it.attendeeDao.findAllAttendees(showing.id)
        assertThat(dbAttendees).hasSize(25)
        dbAttendees.forEach { p->
          if (p.hasPaid || p.type == AttendeeDTO.Type.GIFT_CERTIFICATE) {
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