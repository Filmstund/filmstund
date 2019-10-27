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
import se.filmstund.TestConfig
import se.filmstund.database.DbConfig
import se.filmstund.nextMovie
import se.filmstund.nextShowing
import se.filmstund.nextTicket
import se.filmstund.nextUserDTO
import java.util.concurrent.ThreadLocalRandom

@ExtendWith(SpringExtension::class)
@SpringBootTest(classes = [Jdbi::class])
@Import(TestConfig::class, DbConfig::class)
internal class TicketDaoTest {
  @Autowired
  private lateinit var jdbi: Jdbi

  private val rnd: ThreadLocalRandom = ThreadLocalRandom.current()

  @Test
  internal fun `given an existing ticket, when existsById(), then return true`() {
    val rndMovie = rnd.nextMovie()
    val rndAdmin = rnd.nextUserDTO()
    val rndShowing = rnd.nextShowing(rndMovie.id, rndAdmin.id)
    val rndTicket = rnd.nextTicket(rndShowing.id, rndAdmin.id)

    jdbi.useTransactionUnchecked { handle ->
      val userDao = handle.attach(UserDao::class.java)
      val movieDao = handle.attach(MovieDao::class.java)
      val locationDao = handle.attach(LocationDao::class.java)
      val showingDao = handle.attach(ShowingDao::class.java)
      val ticketDao = handle.attach(TicketDao::class.java)

      userDao.insertUserAndGiftCerts(rndAdmin)
      movieDao.insertMovie(rndMovie)
      locationDao.insertLocationAndAlias(rndShowing.location)
      showingDao.insertShowingAndCinemaScreen(rndShowing)

      assertThat(ticketDao.existsById(rndTicket.id)).isFalse()
      ticketDao.insertTicket(rndTicket)
      assertThat(ticketDao.existsById(rndTicket.id)).isTrue()
    }
  }

  @Test
  internal fun `given an existing ticket, when findByShowing(), then return that ticket`() {
    val rndMovie = rnd.nextMovie()
    val rndAdmin = rnd.nextUserDTO()
    val rndShowing = rnd.nextShowing(rndMovie.id, rndAdmin.id)
    val rndTicket = rnd.nextTicket(rndShowing.id, rndAdmin.id)

    jdbi.useTransactionUnchecked { handle ->
      val userDao = handle.attach(UserDao::class.java)
      val movieDao = handle.attach(MovieDao::class.java)
      val locationDao = handle.attach(LocationDao::class.java)
      val showingDao = handle.attach(ShowingDao::class.java)
      val ticketDao = handle.attach(TicketDao::class.java)

      userDao.insertUserAndGiftCerts(rndAdmin)
      movieDao.insertMovie(rndMovie)
      locationDao.insertLocationAndAlias(rndShowing.location)
      showingDao.insertShowingAndCinemaScreen(rndShowing)
      ticketDao.insertTicket(rndTicket)

      val dbTickets = ticketDao.findByShowing(rndShowing.id)
      assertThat(dbTickets)
        .isNotNull
        .isNotEmpty
        .hasSize(1)
      assertThat(dbTickets[0])
        .isEqualTo(rndTicket)
    }
  }

  @Test
  internal fun `given existing tickets, when findByUserAndShowing(), then return only tickets for that user and showing`() {
    val rndMovie = rnd.nextMovie()
    val rndAdmin = rnd.nextUserDTO()
    val rndUser = rnd.nextUserDTO()
    val rndShowing = rnd.nextShowing(rndMovie.id, rndAdmin.id)

    val rndUserTickets = (1..3).map { rnd.nextTicket(rndShowing.id, rndUser.id) }
    val rndTickets = (1..3).map { rnd.nextTicket(rndShowing.id, rndAdmin.id) }

    jdbi.useTransactionUnchecked { handle ->
      val userDao = handle.attach(UserDao::class.java)
      val movieDao = handle.attach(MovieDao::class.java)
      val locationDao = handle.attach(LocationDao::class.java)
      val showingDao = handle.attach(ShowingDao::class.java)
      val ticketDao = handle.attach(TicketDao::class.java)

      userDao.insertUserAndGiftCerts(rndAdmin)
      userDao.insertUserAndGiftCerts(rndUser)
      movieDao.insertMovie(rndMovie)
      locationDao.insertLocationAndAlias(rndShowing.location)
      showingDao.insertShowingAndCinemaScreen(rndShowing)
      ticketDao.insertTickets(rndTickets)
      ticketDao.insertTickets(rndUserTickets)

      val dbTickets = ticketDao.findByUserAndShowing(rndAdmin.id, rndShowing.id)
      val allDbTickets = ticketDao.findByShowing(rndShowing.id)
      assertThat(dbTickets)
        .isNotNull
        .isNotEmpty
        .hasSameSizeAs(rndTickets)
      assertThat(dbTickets)
        .hasSameElementsAs(rndTickets)
      assertThat(allDbTickets.size)
        .isGreaterThan(dbTickets.size)
    }
  }

  @Test
  internal fun `given an existing ticket, when reassignTicket(), then ticket is successfully reassigned to the new user`() {
    val rndMovie = rnd.nextMovie()
    val rndAdmin = rnd.nextUserDTO()
    val rndUser = rnd.nextUserDTO()
    val rndShowing = rnd.nextShowing(rndMovie.id, rndAdmin.id)
    val rndTicket = rnd.nextTicket(rndShowing.id, rndAdmin.id)

    jdbi.useTransactionUnchecked { handle ->
      val userDao = handle.attach(UserDao::class.java)
      val movieDao = handle.attach(MovieDao::class.java)
      val locationDao = handle.attach(LocationDao::class.java)
      val showingDao = handle.attach(ShowingDao::class.java)
      val ticketDao = handle.attach(TicketDao::class.java)

      userDao.insertUserAndGiftCerts(rndAdmin)
      userDao.insertUserAndGiftCerts(rndUser)
      movieDao.insertMovie(rndMovie)
      locationDao.insertLocationAndAlias(rndShowing.location)
      showingDao.insertShowingAndCinemaScreen(rndShowing)
      ticketDao.insertTicket(rndTicket)

      assertThat(ticketDao.existsById(rndTicket.id))
        .isTrue()
      assertThat(rndTicket.assignedToUser)
        .isEqualTo(rndAdmin.id)

      assertThat(ticketDao.reassignTicket(rndTicket.id, rndAdmin.id, rndUser.id))
        .isTrue()
      val dbTicket = ticketDao.findById(rndTicket.id)
      assertThat(dbTicket.assignedToUser)
        .isEqualTo(rndUser.id)
    }
  }
}