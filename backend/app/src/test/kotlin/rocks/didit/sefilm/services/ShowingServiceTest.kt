package rocks.didit.sefilm.services

import org.assertj.core.api.Assertions.assertThat
import org.jdbi.v3.core.Jdbi
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mockito.`when`
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.context.annotation.Import
import org.springframework.security.access.AccessDeniedException
import org.springframework.test.context.junit.jupiter.SpringExtension
import rocks.didit.sefilm.*
import rocks.didit.sefilm.database.DbConfig
import rocks.didit.sefilm.domain.PaymentOption
import rocks.didit.sefilm.domain.PaymentType
import rocks.didit.sefilm.domain.SEK
import rocks.didit.sefilm.domain.dto.CreateShowingDTO
import rocks.didit.sefilm.domain.dto.FilmstadenShowDTO
import rocks.didit.sefilm.domain.dto.UpdateShowingDTO
import rocks.didit.sefilm.domain.dto.core.CinemaScreenDTO
import rocks.didit.sefilm.domain.dto.core.ParticipantDTO
import rocks.didit.sefilm.domain.dto.core.ShowingDTO
import rocks.didit.sefilm.domain.id.ShowingID
import rocks.didit.sefilm.domain.id.UserID
import rocks.didit.sefilm.events.EventPublisher
import rocks.didit.sefilm.services.external.FilmstadenService
import java.time.LocalDate
import java.time.LocalTime
import java.util.concurrent.ThreadLocalRandom

@ExtendWith(SpringExtension::class)
@SpringBootTest(classes = [ShowingService::class, Jdbi::class, DatabaseTest::class, SlugService::class, LocationService::class, AssertionService::class, UserService::class, GiftCertificateService::class])
@Import(TestConfig::class, DbConfig::class)
internal class ShowingServiceTest {
  @Autowired
  private lateinit var showingService: ShowingService

  @Autowired
  private lateinit var databaseTest: DatabaseTest

  @MockBean
  private lateinit var filmstadenServiceMock: FilmstadenService

  @MockBean
  private lateinit var eventPublisherMock: EventPublisher

  @Test
  internal fun `given a showing, when getShowing, then that showing is returned`() {
    databaseTest.start {
      withShowing()
      afterInsert {
        val showingById = showingService.getShowing(showing.id)
        val showingByWebId = showingService.getShowing(showing.webId)
        assertThat(showingById)
          .isNotNull
          .isEqualTo(showingByWebId)
          .isRoughlyEqualToShowing(showing)
      }
    }
  }

  @Test
  internal fun `given no showing, when getShowingOrThrow, then an NotFoundException is thrown`() {
    assertThrows<NotFoundException> {
      showingService.getShowingOrThrow(ShowingID.random())
    }
  }

  @Test
  internal fun `given two showings, when getShowingByMovie, then two showings are returned`() {
    databaseTest.start {
      withMovie()
      withAdmin()
      withShowings(2) { it.nextShowing(movie.id, admin.id) }
      afterInsert {
        val dbShowings = showingService.getShowingByMovie(movie.id)
        assertThat(dbShowings)
          .hasSize(2)
          .isSortedAccordingTo(compareByDescending(ShowingDTO::date))
        assertThat(dbShowings.map { ShowingDTO::id })
          .containsExactlyInAnyOrderElementsOf(showings.values.map { ShowingDTO::id })
      }
    }
  }

  @Test
  internal fun `given zero showings, when getShowingByMovie, then zero showings are returned`() {
    databaseTest.start {
      withMovie()
      afterInsert {
        val dbShowings = showingService.getShowingByMovie(movie.id)
        assertThat(dbShowings)
          .isEmpty()
      }
    }
  }

  @Test
  internal fun `given a showing, when user is admin and getShowingByUser, then that showing is returned`() {
    databaseTest.start {
      withAdmin()
      withShowing()
      afterInsert {
        val dbShowings = showingService.getShowingByUser(admin.id)
        assertThat(dbShowings).hasSize(1)
        assertThat(dbShowings.first()).isRoughlyEqualToShowing(showing)
      }
    }
  }

  @Test
  internal fun `given a showing, when user is participant and getShowingByUser, then that showing is returned`() {
    databaseTest.start {
      withAdmin()
      withShowing()
      withParticipantOnLastShowing()
      afterInsert {
        val dbShowings = showingService.getShowingByUser(user.id)
        assertThat(dbShowings).hasSize(1)
        assertThat(dbShowings.first()).isRoughlyEqualToShowing(showing)
        assertThat(dbShowings.first().admin).isNotEqualTo(user.id)
      }
    }
  }

  @Test
  internal fun `given multiple showing with different dates, when getShowingsAfterDate, then only showings after that date is returned`() {
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
        val dbShowings = showingService.getShowingsAfterDate(LocalDate.now())

        assertThat(dbShowings)
          .isNotNull
          .isSortedAccordingTo(compareByDescending(ShowingDTO::date))
          .size()
          .isGreaterThanOrEqualTo(5)

        val afterShowings = showings.values.filter { it.date.isAfter(LocalDate.now()) }.map { ShowingDTO::id }

        assertThat(dbShowings.map { ShowingDTO::id })
          .containsExactlyInAnyOrderElementsOf(afterShowings)
      }
    }
  }

  @Test
  @WithLoggedInUser
  internal fun `given a showing, when getAdminPaymentDetails when current user is not the admin, then null is returned`() {
    databaseTest.start {
      withShowing()
      afterInsert {
        assertThat(showingService.getAdminPaymentDetails(showing.id))
          .isNull()
      }
    }
  }

  @Test
  @WithLoggedInUser
  internal fun `given a showing with no participants, when getAdminPaymentDetails(), then the payment details with no participants are returned`() {
    databaseTest.start {
      withUser { it.nextUserDTO(currentLoggedInUser().id) }
      withShowing()
      afterInsert {
        val adminPaymentDetails = showingService.getAdminPaymentDetails(showing.id)
        assertThat(adminPaymentDetails).isNotNull

        assertThat(adminPaymentDetails?.filmstadenBuyLink).isNull()
        assertThat(adminPaymentDetails?.participants).isNotNull.isEmpty()
        assertThat(adminPaymentDetails?.showingId).isEqualTo(showing.id)
      }
    }
  }

  @Test
  @WithLoggedInUser
  internal fun `given a showing with participants, when getAdminPaymentDetails(), then the payment details including participants are returned`() {
    databaseTest.start {
      withUser { it.nextUserDTO(currentLoggedInUser().id) }
      withShowing()
      withParticipantsOnLastShowing(5)
      afterInsert {
        val adminPaymentDetails = showingService.getAdminPaymentDetails(showing.id)
        assertThat(adminPaymentDetails).isNotNull

        assertThat(adminPaymentDetails?.filmstadenBuyLink).isNull()
        assertThat(adminPaymentDetails?.participants).isNotNull.hasSize(5)
        assertThat(adminPaymentDetails?.showingId).isEqualTo(showing.id)
      }
    }
  }

  @Test
  internal fun `given a showing admin without a phone, when getAttendeePaymentDetails(), then an exception is thrown`() {
    databaseTest.start {
      withUser { it.nextUserDTO().copy(phone = null) }
      withShowing()
      withParticipantOnLastShowing()
      afterInsert {
        assertThrows<MissingPhoneNumberException> {
          showingService.getAttendeePaymentDetailsForUser(user.id, showing.id)
        }
      }
    }
  }

  @Test
  internal fun `given a showing and participant, when getAttendeePaymentDetails(), then the correct details are returned`() {
    databaseTest.start {
      withAdmin()
      withShowing()
      withParticipantOnLastShowing()
      afterInsert {
        val attendeePaymentDetails = showingService.getAttendeePaymentDetailsForUser(user.id, showing.id)
        assertThat(attendeePaymentDetails).isNotNull
        assertThat(attendeePaymentDetails?.hasPaid).isEqualTo(participant.hasPaid)
        assertThat(attendeePaymentDetails?.amountOwed).isEqualTo(showing.price)
        assertThat(attendeePaymentDetails?.payTo).isEqualTo(admin.id)
        assertThat(attendeePaymentDetails?.payToPhoneNumber).isEqualTo(admin.phone?.number)
        assertThat(attendeePaymentDetails?.payerUserID).isEqualTo(participant.userId)
        if (participant.hasPaid) {
          assertThat(attendeePaymentDetails?.swishLink).isNull()
        } else {
          assertThat(attendeePaymentDetails?.swishLink).startsWith("swish://payment?data=")
        }
      }
    }
  }

  @Test
  @WithLoggedInUser
  internal fun `given a showing and participant, when attendShowing(), then an exception is thrown`() {
    databaseTest.start {
      withMovie()
      withShowing { it.nextShowing(movie.id, currentLoggedInUser().id).copy(ticketsBought = false) }
      withParticipant { it.nextParticipant(currentLoggedInUser().id, showing.id) }
      afterInsert {
        assertThrows<UserAlreadyAttendedException> {
          showingService.attendShowing(showing.id, PaymentOption(PaymentType.Swish))
        }
      }
    }
  }

  @Test
  @WithLoggedInUser
  internal fun `given a showing that has been bought, when attendShowing(), then an exception is thrown`() {
    databaseTest.start {
      withMovie()
      withShowing { it.nextShowing(movie.id, currentLoggedInUser().id).copy(ticketsBought = true) }
      afterInsert {
        assertThrows<TicketsAlreadyBoughtException> {
          showingService.attendShowing(showing.id, PaymentOption(PaymentType.Swish))
        }
      }
    }
  }

  @Test
  @WithLoggedInUser
  internal fun `given a showing and a user, when attendShowing() with a swish payment option, then user is a swish attendee`() {
    databaseTest.start {
      withMovie()
      withShowing { it.nextShowing(movie.id, currentLoggedInUser().id).copy(ticketsBought = false) }
      afterInsert {
        assertThat(it.participantDao.isParticipantOnShowing(currentLoggedInUser().id, showing.id)).isFalse()
        showingService.attendShowing(showing.id, PaymentOption(PaymentType.Swish))
        val participant = it.participantDao.findByUserAndShowing(currentLoggedInUser().id, showing.id)
        assertThat(participant).isNotNull
        assertThat(participant?.hasPaid).isFalse()
        assertThat(participant?.amountOwed).isEqualTo(SEK.ZERO)
        assertThat(participant?.giftCertificateUsed).isNull()
        assertThat(participant?.type).isEqualTo(ParticipantDTO.Type.SWISH)
      }
    }
  }

  @Test
  @WithLoggedInUser
  internal fun `given a showing and a user, when attendShowing() with a gift cert payment option, then user is a gift cert attendee`() {
    databaseTest.start {
      withMovie()
      withShowing { it.nextShowing(movie.id, currentLoggedInUser().id).copy(ticketsBought = false) }
      afterInsert {
        val giftCert = ThreadLocalRandom.current().nextGiftCert(currentLoggedInUser().id)
          .copy(expiresAt = LocalDate.now().plusDays(1))
        it.userDao.insertGiftCertificate(giftCert)

        assertThat(it.participantDao.isParticipantOnShowing(currentLoggedInUser().id, showing.id)).isFalse()
        showingService.attendShowing(showing.id, PaymentOption(PaymentType.GiftCertificate, giftCert.number.number))

        val participant = it.participantDao.findByUserAndShowing(currentLoggedInUser().id, showing.id)
        assertThat(participant).isNotNull
        assertThat(participant?.hasPaid).isFalse()
        assertThat(participant?.amountOwed).isEqualTo(SEK.ZERO)
        assertThat(participant?.giftCertificateUsed).isEqualTo(giftCert)
        assertThat(participant?.type).isEqualTo(ParticipantDTO.Type.GIFT_CERTIFICATE)
      }
    }
  }

  @Test
  @WithLoggedInUser
  internal fun `given a bought showing with a participant, when unattendShowing(), then an exception is thrown`() {
    databaseTest.start {
      withMovie()
      withShowing { it.nextShowing(movie.id, currentLoggedInUser().id).copy(ticketsBought = true) }
      withParticipant { it.nextParticipant(currentLoggedInUser().id, showing.id) }
      afterInsert {
        assertThat(it.participantDao.isParticipantOnShowing(currentLoggedInUser().id, showing.id)).isTrue()
        assertThrows<TicketsAlreadyBoughtException> {
          showingService.unattendShowing(showing.id)
        }
        assertThat(it.participantDao.isParticipantOnShowing(currentLoggedInUser().id, showing.id)).isTrue()
      }
    }
  }

  @Test
  @WithLoggedInUser
  internal fun `given a showing without participant, when unattendShowing(), then an exception is thrown`() {
    databaseTest.start {
      withShowing(currentLoggedInUser().id)
      afterInsert {
        assertThat(it.participantDao.isParticipantOnShowing(currentLoggedInUser().id, showing.id)).isFalse()
        assertThrows<UnattendedException> {
          showingService.unattendShowing(showing.id)
        }
        assertThat(it.participantDao.isParticipantOnShowing(currentLoggedInUser().id, showing.id)).isFalse()
      }
    }
  }

  @Test
  @WithLoggedInUser
  internal fun `given a showing with a participant, when unattendShowing(), then the user isnt a participant anymore`() {
    databaseTest.start {
      withShowing(currentLoggedInUser().id)
      withParticipant { it.nextParticipant(currentLoggedInUser().id, showing.id) }
      afterInsert {
        assertThat(it.participantDao.isParticipantOnShowing(currentLoggedInUser().id, showing.id)).isTrue()
        showingService.unattendShowing(showing.id)
        assertThat(it.participantDao.isParticipantOnShowing(currentLoggedInUser().id, showing.id)).isFalse()
      }
    }
  }

  @Test
  @WithLoggedInUser
  internal fun `given a logged in user, when createShowing(), then a showing with the current user as admin is created`() {
    databaseTest.start {
      withMovie()
      afterInsert {
        val createShowing = CreateShowingDTO(
          LocalDate.now(),
          LocalTime.MIDNIGHT,
          movie.id,
          "NewLocation",
          CinemaScreenDTO("fsidASDF", "Salong X"),
          "remoteEntityId"
        )
        val showing = showingService.createShowing(createShowing)

        val adminParticipant = it.participantDao.findByUserAndShowing(currentLoggedInUser().id, showing.id)
        assertThat(adminParticipant).isNotNull
        assertThat(adminParticipant?.type).isEqualTo(ParticipantDTO.Type.SWISH)
        assertThat(it.showingDao.findById(showing.id)).isEqualToIgnoringGivenFields(
          showing,
          "payToPhone",
          "lastModifiedDate",
          "createdDate"
        )
        assertThat(showing.admin).isEqualTo(currentLoggedInUser().id)
        assertThat(showing.payToUser).isEqualTo(currentLoggedInUser().id)
        //assertThat(showing.payToPhone?.number).isEqualTo(currentLoggedInUser().phone)
      }
    }
  }

  @Test
  @WithLoggedInUser
  internal fun `given a showing, when deleteShowing() by a non-admin, then an exception is thrown`() {
    databaseTest.start {
      withShowing()
      afterInsert {
        assertThrows<AccessDeniedException> {
          showingService.deleteShowing(showing.id)
        }
      }
    }
  }

  @Test
  @WithLoggedInUser
  internal fun `given a showing that has been bought, when deleteShowing() by the admin, then an exception is thrown`() {
    databaseTest.start {
      withMovie()
      withShowing { it.nextShowing(movie.id, currentLoggedInUser().id).copy(ticketsBought = true) }
      afterInsert {
        assertThrows<TicketsAlreadyBoughtException> {
          showingService.deleteShowing(showing.id)
        }
      }
    }
  }

  @Test
  @WithLoggedInUser
  internal fun `given a showing, when deleteShowing(), then the showing is no more`() {
    databaseTest.start {
      withMovie()
      withShowing { it.nextShowing(movie.id, currentLoggedInUser().id).copy(ticketsBought = false) }
      afterInsert {
        val showings = showingService.deleteShowing(showing.id)
        assertThat(showings.map(ShowingDTO::id))
          .doesNotContain(showing.id)
        assertThat(it.showingDao.findById(showing.id)).isNull()
      }
    }
  }

  @Test
  @WithLoggedInUser
  internal fun `given a showing, when markAsBought by non-admin, then an exception is thrown`() {
    databaseTest.start {
      withShowing()
      afterInsert {
        assertThrows<AccessDeniedException> {
          showingService.markAsBought(showing.id, SEK(1337))
        }
      }
    }
  }

  @Test
  @WithLoggedInUser(true)
  internal fun `given a showing and the admin doesnt have a phone number, when markAsBought, then an exception is thrown`() {
    databaseTest.start {
      withMovie()
      withShowing { it.nextShowing(movie.id, currentLoggedInUser().id).copy(ticketsBought = false) }
      afterInsert {
        assertThrows<MissingPhoneNumberException> {
          showingService.markAsBought(showing.id, SEK(1337))
        }
      }
    }
  }

  @Test
  @WithLoggedInUser
  internal fun `given a showing with multiple participants, when markAsBought(), then the showing has marked as bought`() {
    databaseTest.start {
      withMovie()
      withShowing { it.nextShowing(movie.id, currentLoggedInUser().id).copy(ticketsBought = false) }
      withParticipantsAndUsers(5) {
        val userId = UserID.random()
        val user = it.nextUserDTO(userId, it.nextGiftCerts(userId, 1))
        val participant =
          it.nextParticipant(userId, showing.id, user.giftCertificates.first().number).copy(hasPaid = false)
        Pair(user, participant)
      }
      withParticipantsAndUsers(5) {
        val user = it.nextUserDTO(UserID.random(), listOf())
        val participant = it.nextParticipant(user.id, showing.id).copy(hasPaid = false)
        Pair(user, participant)
      }
      withParticipant { it.nextParticipant(showing.admin, showing.id) }
      afterInsert {
        val updatedShowing = showingService.markAsBought(showing.id, SEK(1337))
        assertThat(updatedShowing.ticketsBought).isTrue()
        assertThat(updatedShowing.price).isEqualTo(SEK(1337))

        val dbShowing = it.showingDao.findById(showing.id)
        assertThat(dbShowing?.ticketsBought).isTrue()
        assertThat(dbShowing?.price).isEqualTo(SEK(1337))

        val allParticipants = it.participantDao.findAllParticipants(showing.id)
        assertThat(allParticipants).hasSize(11)
        allParticipants.forEach { p ->
          if (p.type == ParticipantDTO.Type.SWISH && p.userId != currentLoggedInUser().id) {
            assertThat(p.hasPaid).isFalse()
            assertThat(p.amountOwed).isEqualTo(SEK(1337))
          } else {
            assertThat(p.hasPaid).isTrue()
            assertThat(p.amountOwed).isEqualTo(SEK.ZERO)
          }
        }
      }
    }
  }

  @Test
  @WithLoggedInUser
  internal fun `given a showing, when updateShowing() when current user is not the admin, then an exception is thrown`() {
    databaseTest.start {
      withShowing()
      withUser()
      afterInsert {
        val newValues = UpdateShowingDTO(date = LocalDate.now(), payToUser = user.id)
        assertThrows<AccessDeniedException> {
          showingService.updateShowing(showing.id, newValues)
        }
      }
    }
  }

  @Test
  @WithLoggedInUser
  internal fun `given a showing, when updateShowing(), then relevant fields are updated`() {
    databaseTest.start {
      withMovie()
      withShowing { it.nextShowing(movie.id, currentLoggedInUser().id).copy(ticketsBought = false) }
      withUser()
      afterInsert {
        val showMock = rnd.nextObject(FilmstadenShowDTO::class.java)
        `when`(filmstadenServiceMock.fetchFilmstadenShow("fsreid1337"))
          .thenReturn(showMock)

        val newValues = UpdateShowingDTO(
          price = SEK(1337).ören,
          payToUser = user.id,
          location = "NewLocation1337UpdateShowing",
          time = LocalTime.NOON,
          date = LocalDate.now(),
          filmstadenRemoteEntityId = "fsreid1337"
        )
        val updatedShowing = showingService.updateShowing(showing.id, newValues)

        val dbShowing = it.showingDao.findById(showing.id)
        assertThat(dbShowing)
          .isEqualToIgnoringGivenFields(updatedShowing, "lastModifiedDate", "payToPhone")
        assertThat(dbShowing?.lastModifiedDate).isAfter(updatedShowing.lastModifiedDate)
        // FIXME: assert that payToPhone has been correctly updated
        assertThat(dbShowing?.cinemaScreen).isNotNull.isEqualTo(CinemaScreenDTO.from(showMock.screen))
      }
    }
  }

  @Test
  @WithLoggedInUser
  internal fun `given a showing, when updateShowing() where filmstadenRemoteEntityId is null, then fields are updated but the cinema screen is not`() {
    databaseTest.start {
      withMovie()
      withShowing { it.nextShowing(movie.id, currentLoggedInUser().id).copy(ticketsBought = false) }
      withUser()
      afterInsert {
        val newValues = UpdateShowingDTO(
          price = SEK(1337).ören,
          payToUser = user.id,
          location = "NewLocation1337UpdateShowing",
          time = LocalTime.NOON,
          date = LocalDate.now(),
          filmstadenRemoteEntityId = null
        )
        val updatedShowing = showingService.updateShowing(showing.id, newValues)

        val dbShowing = it.showingDao.findById(showing.id)
        assertThat(dbShowing)
          .isEqualToIgnoringGivenFields(updatedShowing, "lastModifiedDate", "payToPhone")
        assertThat(dbShowing?.lastModifiedDate).isAfter(updatedShowing.lastModifiedDate)
        assertThat(showing.cinemaScreen).isNotNull
        // No update to the cinema screen should have been done
        assertThat(dbShowing?.cinemaScreen).isNotNull.isEqualTo(showing.cinemaScreen)
      }
    }
  }
}

