package rocks.didit.sefilm.services

import org.assertj.core.api.Assertions.assertThat
import org.jdbi.v3.core.Jdbi
import org.jdbi.v3.core.kotlin.inTransactionUnchecked
import org.junit.Test
import org.junit.jupiter.api.assertThrows
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.junit4.SpringRunner
import rocks.didit.sefilm.TestConfig
import rocks.didit.sefilm.TicketAlreadyInUserException
import rocks.didit.sefilm.TicketInUseException
import rocks.didit.sefilm.WithLoggedInUser
import rocks.didit.sefilm.currentLoggedInUser
import rocks.didit.sefilm.database.DbConfig
import rocks.didit.sefilm.database.dao.LocationDao
import rocks.didit.sefilm.database.dao.MovieDao
import rocks.didit.sefilm.database.dao.ParticipantDao
import rocks.didit.sefilm.database.dao.ShowingDao
import rocks.didit.sefilm.database.dao.UserDao
import rocks.didit.sefilm.domain.dto.GiftCertificateDTO
import rocks.didit.sefilm.domain.dto.core.ParticipantDTO
import rocks.didit.sefilm.nextGiftCert
import rocks.didit.sefilm.nextGiftCerts
import rocks.didit.sefilm.nextMovie
import rocks.didit.sefilm.nextParticipant
import rocks.didit.sefilm.nextShowing
import rocks.didit.sefilm.nextUserDTO
import java.time.LocalDate
import java.util.*
import java.util.concurrent.ThreadLocalRandom

@RunWith(SpringRunner::class)
@SpringBootTest(classes = [Jdbi::class, GiftCertificateService::class])
@Import(TestConfig::class, DbConfig::class)
internal class GiftCertificateServiceTest {
  @Autowired
  private lateinit var jdbi: Jdbi

  @Autowired
  private lateinit var giftCertificateService: GiftCertificateService

  private val rnd: ThreadLocalRandom = ThreadLocalRandom.current()

  private fun insertRandomParticipant(
    userId: UUID = UUID.randomUUID(),
    hasPaid: Boolean = false,
    skipGiftCert: Boolean = false
  ): Pair<ParticipantDTO, GiftCertificateDTO> {
    return jdbi.inTransactionUnchecked {
      val movieDao = it.attach(MovieDao::class.java)
      val showingDao = it.attach(ShowingDao::class.java)
      val userDao = it.attach(UserDao::class.java)
      val participantDao = it.attach(ParticipantDao::class.java)
      val locationDao = it.attach(LocationDao::class.java)

      val giftCert = rnd.nextGiftCert(userId).copy(expiresAt = LocalDate.now().plusDays(1))
      val user =
        if (userDao.existsById(userId)) userDao.findById(userId)!!.copy(giftCertificates = listOf(giftCert)) else rnd.nextUserDTO(
          userId,
          listOf(giftCert)
        )
      val movie = rnd.nextMovie()
      val showing = rnd.nextShowing(movie.id, userId).copy(ticketsBought = hasPaid)
      val participant =
        rnd.nextParticipant(userId, showing.id, if (skipGiftCert) null else giftCert.number).copy(hasPaid = hasPaid)

      if (!userDao.existsById(userId)) {
        userDao.insertUserAndGiftCerts(user)
      } else {
        userDao.insertGiftCertificates(user.giftCertificates)
      }
      movieDao.insertMovie(movie)
      locationDao.insertLocationAndAlias(showing.location!!)
      showingDao.insertShowingAndCinemaScreen(showing)
      participantDao.insertParticipantOnShowing(participant)

      return@inTransactionUnchecked Pair(participantDao.findAllParticipants(showing.id).first(), giftCert)
    }
  }

  @Test
  internal fun `given a showing with participants, when gift cert is used, but participant has not paid, then status if the gift cert is pending`() {
    val participantAndCert = insertRandomParticipant()
    assertThat(participantAndCert.first.hasPaid)
      .describedAs("Has paid")
      .isFalse()
    assertThat(participantAndCert.first.giftCertificateUsed).isNotNull
    assertThat(giftCertificateService.getStatusOfTicket(participantAndCert.first.giftCertificateUsed!!))
      .describedAs("Gift cert status")
      .isEqualTo(GiftCertificateDTO.Status.PENDING)
  }

  @Test
  internal fun `given a showing with participants, when gift cert is used and participant "has paid", then status of the gift cert is used`() {
    val participantAndCert = insertRandomParticipant(hasPaid = true)
    assertThat(participantAndCert.first.hasPaid)
      .describedAs("Has paid")
      .isTrue()
    assertThat(participantAndCert.first.giftCertificateUsed).isNotNull
    assertThat(giftCertificateService.getStatusOfTicket(participantAndCert.first.giftCertificateUsed!!))
      .describedAs("Gift cert status")
      .isEqualTo(GiftCertificateDTO.Status.USED)
  }

  @Test
  internal fun `given a showing with participants, when gift cert is not used, then status of the gift cert is available`() {
    val participantAndCert = insertRandomParticipant(hasPaid = true, skipGiftCert = true)
    assertThat(participantAndCert.first.hasPaid)
      .describedAs("Has paid")
      .isTrue()
    assertThat(participantAndCert.first.giftCertificateUsed).isNull()
    assertThat(giftCertificateService.getStatusOfTicket(participantAndCert.second))
      .describedAs("Gift cert status")
      .isEqualTo(GiftCertificateDTO.Status.AVAILABLE)
  }

  @Test
  internal fun `given a gift cert, when gift cert expire_at is in the past, then status of the gift cert is expired`() {
    val giftCertYesterday = rnd.nextGiftCert(UUID.randomUUID()).copy(expiresAt = LocalDate.now().minusDays(1))

    assertThat(giftCertificateService.getStatusOfTicket(giftCertYesterday))
      .isEqualTo(GiftCertificateDTO.Status.EXPIRED)
  }

  @Test
  internal fun `given a gift cert, when gift cert expire_at is today, then status of the gift cert is expired`() {
    val giftCertToday = rnd.nextGiftCert(UUID.randomUUID()).copy(expiresAt = LocalDate.now())

    assertThat(giftCertificateService.getStatusOfTicket(giftCertToday))
      .isEqualTo(GiftCertificateDTO.Status.EXPIRED)
  }

  @Test
  internal fun `given a gift cert, when gift cert expire_at is tomorrow, then the gift cert status is not expired`() {
    val giftCertTomorrow = rnd.nextGiftCert(UUID.randomUUID()).copy(expiresAt = LocalDate.now().plusDays(1))

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
    val participant = insertRandomParticipant(userId, hasPaid = false, skipGiftCert = false)
    assertThat(giftCertificateService.getGiftCertsByUserId(userId)).isNotNull.isNotEmpty
      .hasSize(1)

    assertThat(giftCertificateService.getStatusOfTicket(participant.second)).isEqualTo(GiftCertificateDTO.Status.PENDING)
    assertThrows<TicketInUseException> {
      giftCertificateService.deleteTicketFromUser(participant.second)
    }
    assertThat(jdbi.onDemand(UserDao::class.java).existGiftCertByNumber(participant.second.number))
      .describedAs("Gift cert still exists")
      .isTrue()
  }
}