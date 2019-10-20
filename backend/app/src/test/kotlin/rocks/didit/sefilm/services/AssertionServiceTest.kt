package rocks.didit.sefilm.services

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.security.access.AccessDeniedException
import org.springframework.test.context.junit.jupiter.SpringExtension
import rocks.didit.sefilm.DatabaseTest
import rocks.didit.sefilm.FilmstadenTicketException
import rocks.didit.sefilm.MissingPhoneNumberException
import rocks.didit.sefilm.TestConfig
import rocks.didit.sefilm.TicketAlreadyUsedException
import rocks.didit.sefilm.TicketExpiredException
import rocks.didit.sefilm.TicketNotFoundException
import rocks.didit.sefilm.TicketsAlreadyBoughtException
import rocks.didit.sefilm.WithLoggedInUser
import rocks.didit.sefilm.currentLoggedInUser
import rocks.didit.sefilm.database.DbConfig
import rocks.didit.sefilm.domain.id.MovieID
import rocks.didit.sefilm.domain.id.UserID
import rocks.didit.sefilm.nextGiftCert
import rocks.didit.sefilm.nextAttendee
import rocks.didit.sefilm.nextShowing
import rocks.didit.sefilm.nextUserDTO
import java.time.LocalDate
import java.util.concurrent.ThreadLocalRandom

@ExtendWith(SpringExtension::class)
@SpringBootTest(classes = [AssertionService::class, GiftCertificateService::class, DatabaseTest::class])
@Import(TestConfig::class, DbConfig::class)
internal class AssertionServiceTest {

  private val rnd: ThreadLocalRandom = ThreadLocalRandom.current()

  @Autowired
  private lateinit var databaseTest: DatabaseTest

  @Autowired
  private lateinit var assertionService: AssertionService

  @Test
  internal fun `given a showing with bought tickets, when assertTicketsNotBought(), then an exception is thrown`() {
    val showing = rnd.nextShowing(MovieID.random(), UserID.random()).copy(ticketsBought = true)
    val e = assertThrows<TicketsAlreadyBoughtException> {
      assertionService.assertTicketsNotBought(showing.admin, showing)
    }
    assertThat(e).hasMessage("The action is not allowed since the tickets for this showing is already bought")
  }

  @Test
  internal fun `given a showing hasnt been bought, when assertTicketsNotBought(), then an exception is not thrown`() {
    val showing = rnd.nextShowing(MovieID.random(), UserID.random()).copy(ticketsBought = false)
    assertionService.assertTicketsNotBought(showing.admin, showing)
  }

  @Test
  @WithLoggedInUser
  internal fun `given a showing where current user is not admin, then assertLoggedInUserIsAdmin(), then an exception is thrown`() {
    val showing = rnd.nextShowing(MovieID.random(), UserID.random())
    val e = assertThrows<AccessDeniedException> {
      assertionService.assertLoggedInUserIsAdmin(showing)
    }
    assertThat(e).hasMessage("Only the showing admin is allowed to do that")
  }

  @Test
  @WithLoggedInUser
  internal fun `given a showing where current user is admin, when assertLoggedInUserIsAdmin(), then no exception is thrown`() {
    val showing = rnd.nextShowing(MovieID.random(), currentLoggedInUser().id)
    assertionService.assertLoggedInUserIsAdmin(showing)
  }

  @Test
  internal fun `given a user with null phone number, when assertUserHasPhoneNumber(), then an exception is thrown`() {
    databaseTest.start {
      withUser { it.nextUserDTO().copy(phone = null) }
      afterInsert {
        val dbUser = it.userDao.findById(user.id)
        assertThat(dbUser).isNotNull
        assertThat(dbUser?.phone).isNull()
        val e = assertThrows<MissingPhoneNumberException> {
          assertionService.assertUserHasPhoneNumber(user.id)
        }
        assertThat(e).hasMessage("You are missing a phone number.")
      }
    }
  }

  @Test
  internal fun `given a user with a phone number, when assertUserHasPhoneNumber(), then no exception is thrown`() {
    databaseTest.start {
      withUser()
      afterInsert {
        val dbUser = it.userDao.findById(user.id)
        assertThat(dbUser).isNotNull
        assertThat(dbUser?.phone).isNotNull
        assertionService.assertUserHasPhoneNumber(user.id)
      }
    }
  }

  @Test
  @WithLoggedInUser
  internal fun `given a non existent gift cert, when assertGiftCertIsUsable(), then an exception is thrown`() {
    val userId = currentLoggedInUser().id
    val ticketNumber = rnd.nextGiftCert(userId).number
    val e = assertThrows<TicketNotFoundException> {
      assertionService.assertGiftCertIsUsable(userId, ticketNumber, rnd.nextShowing(MovieID.random(), userId))
    }
    assertThat(e).hasMessage("Ticket $ticketNumber not found")
  }

  @Test
  internal fun `given an expired gift cert, when assertGiftCertIsUsable(), then an exception is thrown`() {
    databaseTest.start {
      withUser {
        val userId = UserID.random()
        it.nextUserDTO(userId, listOf(it.nextGiftCert(userId).copy(expiresAt = LocalDate.now().plusDays(9))))
      }
      withMovie()
      withShowing { it.nextShowing(movie.id, user.id).copy(date = LocalDate.now().plusDays(10)) }
      withAttendee { it.nextAttendee(user.id, showing.id, user.giftCertificates.first().number) }
      afterInsert {
        val e = assertThrows<TicketExpiredException> {
          assertionService.assertGiftCertIsUsable(user.id, user.giftCertificates.first().number, showing)
        }
        assertThat(e).hasMessage("The ticket ${user.giftCertificates.first().number} has expired or will expire before the showing will be bought")
      }
    }
  }

  @Test
  internal fun `given a used gift cert, when assertGiftCertIsUsable(), then an exception is thrown`() {
    databaseTest.start {
      withUser {
        val userId = UserID.random()
        it.nextUserDTO(userId, listOf(it.nextGiftCert(userId).copy(expiresAt = LocalDate.now().plusDays(10))))
      }
      withMovie()
      withShowing { it.nextShowing(movie.id, user.id).copy(date = LocalDate.now().plusDays(10)) }
      withAttendee { it.nextAttendee(user.id, showing.id, user.giftCertificates.first().number) }
      afterInsert {
        val e = assertThrows<TicketAlreadyUsedException> {
          assertionService.assertGiftCertIsUsable(user.id, user.giftCertificates.first().number, showing)
        }
        assertThat(e).hasMessage("The ticket ${user.giftCertificates.first().number} has already been used")
      }
    }
  }

  @Test
  internal fun `given a malformed ticket url, when validateFilmstadenTicketUrl, then an exception is thrown`() {
    val url = "https://www.sf.se/bokning/mina-e-biljetter/Sys99-SE/AA-1036-201908221930/RE-99RBBT0ZP6"
    assertThrows<FilmstadenTicketException> {
      assertionService.validateFilmstadenTicketUrls(listOf(url))
    }
  }

  @Test
  internal fun `given one valid url and one malformed ticket url, when validateFilmstadenTicketUrl, then an exception is thrown`() {
    val urlOne = "https://www.filmstaden.se/bokning/mina-e-biljetter/Sys99-SE/AA-1036-201908221930/RE-99RBBT0ZP6"
    val urlTwo = "https://www.sf.se/bokning/mina-e-biljetter/Sys99-SE/AA-1036-201908221930/RE-99RBBT0ZP6"
    assertThrows<FilmstadenTicketException> {
      assertionService.validateFilmstadenTicketUrls(listOf(urlOne, urlTwo))
    }
  }

  @Test
  internal fun `given a valid url, when validateFilmstadenTicketUrl, then no exception is thrown`() {
    val urlOne = "https://www.filmstaden.se/bokning/mina-e-biljetter/Sys99-SE/AA-1036-201908221930/RE-99RBBT0ZP6"
    val urlTwo = "https://www.filmstaden.se/bokning/mina-e-biljetter/Sys99-SE/AA-1036-201910161930/RE-99RBBT0ZP6"
    assertionService.validateFilmstadenTicketUrls(listOf(urlOne, urlTwo))
  }
}