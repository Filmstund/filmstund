package rocks.didit.sefilm.services

import org.assertj.core.api.Assertions.assertThat
import org.jdbi.v3.core.Jdbi
import org.jdbi.v3.core.kotlin.inTransactionUnchecked
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.junit.jupiter.SpringExtension
import rocks.didit.sefilm.TestConfig
import rocks.didit.sefilm.TicketAlreadyInUserException
import rocks.didit.sefilm.TicketInUseException
import rocks.didit.sefilm.WithLoggedInUser
import rocks.didit.sefilm.currentLoggedInUser
import rocks.didit.sefilm.database.DbConfig
import rocks.didit.sefilm.database.dao.LocationDao
import rocks.didit.sefilm.database.dao.MovieDao
import rocks.didit.sefilm.database.dao.AttendeeDao
import rocks.didit.sefilm.database.dao.ShowingDao
import rocks.didit.sefilm.database.dao.UserDao
import rocks.didit.sefilm.domain.dto.GiftCertificateDTO
import rocks.didit.sefilm.domain.dto.core.AttendeeDTO
import rocks.didit.sefilm.domain.id.UserID
import rocks.didit.sefilm.nextGiftCert
import rocks.didit.sefilm.nextGiftCerts
import rocks.didit.sefilm.nextMovie
import rocks.didit.sefilm.nextAttendee
import rocks.didit.sefilm.nextShowing
import rocks.didit.sefilm.nextUserDTO
import java.time.LocalDate
import java.util.concurrent.ThreadLocalRandom

@ExtendWith(SpringExtension::class)
@SpringBootTest(classes = [Jdbi::class, GiftCertificateService::class])
@Import(TestConfig::class, DbConfig::class)
internal class GiftCertificateServiceTest {
  @Autowired
  private lateinit var jdbi: Jdbi

  @Autowired
  private lateinit var giftCertificateService: GiftCertificateService

  private val rnd: ThreadLocalRandom = ThreadLocalRandom.current()

  private fun insertRandomAttendee(
    userId: UserID = UserID.random(),
    hasPaid: Boolean = false,
    skipGiftCert: Boolean = false
  ): Pair<AttendeeDTO, GiftCertificateDTO> {
    return jdbi.inTransactionUnchecked {
      val movieDao = it.attach(MovieDao::class.java)
      val showingDao = it.attach(ShowingDao::class.java)
      val userDao = it.attach(UserDao::class.java)
      val attendeeDao = it.attach(AttendeeDao::class.java)
      val locationDao = it.attach(LocationDao::class.java)

      val giftCert = rnd.nextGiftCert(userId).copy(expiresAt = LocalDate.now().plusDays(1))
      val user =
        if (userDao.existsById(userId)) userDao.findById(userId)!!.copy(giftCertificates = listOf(giftCert)) else rnd.nextUserDTO(
          userId,
          listOf(giftCert)
        )
      val movie = rnd.nextMovie()
      val showing = rnd.nextShowing(movie.id, userId).copy(ticketsBought = hasPaid)
      val attendee =
        rnd.nextAttendee(userId, showing.id, if (skipGiftCert) null else giftCert.number).copy(hasPaid = hasPaid)

      if (!userDao.existsById(userId)) {
        userDao.insertUserAndGiftCerts(user)
      } else {
        userDao.insertGiftCertificates(user.giftCertificates)
      }
      movieDao.insertMovie(movie)
      locationDao.insertLocationAndAlias(showing.location!!)
      showingDao.insertShowingAndCinemaScreen(showing)
      attendeeDao.insertAttendeeOnShowing(attendee)

      return@inTransactionUnchecked Pair(attendeeDao.findAllAttendees(showing.id).first(), giftCert)
    }
  }

  @Test
  internal fun `given a showing with attendees, when gift cert is used, but attendee has not paid, then status if the gift cert is pending`() {
    val attendeeAndCert = insertRandomAttendee()
    assertThat(attendeeAndCert.first.hasPaid)
      .describedAs("Has paid")
      .isFalse()
    assertThat(attendeeAndCert.first.giftCertificateUsed).isNotNull
    assertThat(giftCertificateService.getStatusOfTicket(attendeeAndCert.first.giftCertificateUsed!!))
      .describedAs("Gift cert status")
      .isEqualTo(GiftCertificateDTO.Status.PENDING)
  }

  @Test
  internal fun `given a showing with attendees, when gift cert is used and attendee "has paid", then status of the gift cert is used`() {
    val attendeeAndCert = insertRandomAttendee(hasPaid = true)
    assertThat(attendeeAndCert.first.hasPaid)
      .describedAs("Has paid")
      .isTrue()
    assertThat(attendeeAndCert.first.giftCertificateUsed).isNotNull
    assertThat(giftCertificateService.getStatusOfTicket(attendeeAndCert.first.giftCertificateUsed!!))
      .describedAs("Gift cert status")
      .isEqualTo(GiftCertificateDTO.Status.USED)
  }

  @Test
  internal fun `given a showing with attendees, when gift cert is not used, then status of the gift cert is available`() {
    val attendeeAndCert = insertRandomAttendee(hasPaid = true, skipGiftCert = true)
    assertThat(attendeeAndCert.first.hasPaid)
      .describedAs("Has paid")
      .isTrue()
    assertThat(attendeeAndCert.first.giftCertificateUsed).isNull()
    assertThat(giftCertificateService.getStatusOfTicket(attendeeAndCert.second))
      .describedAs("Gift cert status")
      .isEqualTo(GiftCertificateDTO.Status.AVAILABLE)
  }

  @Test
  internal fun `given a gift cert, when gift cert expire_at is in the past, then status of the gift cert is expired`() {
    val giftCertYesterday = rnd.nextGiftCert(UserID.random()).copy(expiresAt = LocalDate.now().minusDays(1))

    assertThat(giftCertificateService.getStatusOfTicket(giftCertYesterday))
      .isEqualTo(GiftCertificateDTO.Status.EXPIRED)
  }

  @Test
  internal fun `given a gift cert, when gift cert expire_at is today, then status of the gift cert is expired`() {
    val giftCertToday = rnd.nextGiftCert(UserID.random()).copy(expiresAt = LocalDate.now())

    assertThat(giftCertificateService.getStatusOfTicket(giftCertToday))
      .isEqualTo(GiftCertificateDTO.Status.EXPIRED)
  }

  @Test
  internal fun `given a gift cert, when gift cert expire_at is tomorrow, then the gift cert status is not expired`() {
    val giftCertTomorrow = rnd.nextGiftCert(UserID.random()).copy(expiresAt = LocalDate.now().plusDays(1))

    assertThat(giftCertificateService.getStatusOfTicket(giftCertTomorrow))
      .isNotEqualTo(GiftCertificateDTO.Status.EXPIRED)
  }

  @Test
  @WithLoggedInUser
  fun `given a user, when addGiftCertsToCurrentUser(), then those gift certs are added to the user`() {
    val userId = currentLoggedInUser().id
    val giftCerts = rnd.nextGiftCerts(userId, 10)

    assertThat(giftCertificateService.getGiftCertsByUserId(userId))
      .isNotNull
      .isEmpty()
    giftCertificateService.addGiftCertsToCurrentUser(giftCerts)
    assertThat(giftCertificateService.getGiftCertsByUserId(userId))
      .isNotNull
      .isNotEmpty
      .containsExactlyInAnyOrderElementsOf(giftCerts)
  }

  @Test
  @WithLoggedInUser
  fun `given a user with gift certs, when addGiftCertsToCurrentUser() with existing gift certs, then an exception is thrown`() {
    val userId = currentLoggedInUser().id
    val giftCerts = rnd.nextGiftCerts(userId, 2)

    assertThat(giftCertificateService.getGiftCertsByUserId(userId)).isNotNull.isEmpty()
    giftCertificateService.addGiftCertsToCurrentUser(giftCerts)

    val e = assertThrows<TicketAlreadyInUserException> {
      giftCertificateService.addGiftCertsToCurrentUser(giftCerts)
    }
    assertThat(e.message)
      .isNotNull()
      .contains("One or more of your gift certs is already in use")
  }

  @Test
  @WithLoggedInUser
  fun `given a user with a gift cert, when deleteTicketFromUser(), then gift cert is deleted`() {
    val userId = currentLoggedInUser().id
    val giftCerts = rnd.nextGiftCerts(userId, 0)

    assertThat(giftCertificateService.getGiftCertsByUserId(userId)).isNotNull.isEmpty()
    giftCertificateService.addGiftCertsToCurrentUser(giftCerts)
    assertThat(giftCertificateService.getGiftCertsByUserId(userId)).isNotNull.isNotEmpty
      .hasSize(1)
      .containsExactlyInAnyOrderElementsOf(giftCerts)

    giftCertificateService.deleteTicketFromUser(giftCerts.first())
    assertThat(giftCertificateService.getGiftCertsByUserId(userId)).isNotNull.isEmpty()
  }

  @Test
  @WithLoggedInUser
  fun `given a user with a gift cert, when deleteTicketFromUser() but gift cert has status pending, then gift cert is NOT deleted and an exception is thrown`() {
    val userId = currentLoggedInUser().id
    val attendee = insertRandomAttendee(userId, hasPaid = false, skipGiftCert = false)
    assertThat(giftCertificateService.getGiftCertsByUserId(userId)).isNotNull.isNotEmpty
      .hasSize(1)

    assertThat(giftCertificateService.getStatusOfTicket(attendee.second)).isEqualTo(GiftCertificateDTO.Status.PENDING)
    assertThrows<TicketInUseException> {
      giftCertificateService.deleteTicketFromUser(attendee.second)
    }
    assertThat(jdbi.onDemand(UserDao::class.java).existGiftCertByNumber(attendee.second.number))
      .describedAs("Gift cert still exists")
      .isTrue()
  }
}