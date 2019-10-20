package rocks.didit.sefilm.services

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.ArgumentMatchers
import org.mockito.Mockito.`when`
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.context.annotation.Import
import org.springframework.security.access.AccessDeniedException
import org.springframework.test.context.junit.jupiter.SpringExtension
import rocks.didit.sefilm.DatabaseTest
import rocks.didit.sefilm.FilmstadenTicketException
import rocks.didit.sefilm.Properties
import rocks.didit.sefilm.TestConfig
import rocks.didit.sefilm.WithLoggedInUser
import rocks.didit.sefilm.currentLoggedInUser
import rocks.didit.sefilm.database.DbConfig
import rocks.didit.sefilm.domain.dto.FilmstadenShowDTO
import rocks.didit.sefilm.domain.dto.FilmstadenTicketDTO
import rocks.didit.sefilm.domain.dto.SeatRange
import rocks.didit.sefilm.domain.dto.TicketRange
import rocks.didit.sefilm.domain.dto.core.CinemaScreenDTO
import rocks.didit.sefilm.domain.dto.core.TicketDTO
import rocks.didit.sefilm.nextAttendee
import rocks.didit.sefilm.nextTicket
import rocks.didit.sefilm.services.external.FilmstadenService
import java.time.Instant
import java.time.ZoneId

@ExtendWith(SpringExtension::class)
@SpringBootTest(classes = [TicketService::class, DatabaseTest::class, Properties::class, LocationService::class, AssertionService::class, GiftCertificateService::class])
@Import(TestConfig::class, DbConfig::class)
internal class TicketServiceTest {
  @Autowired
  private lateinit var ticketService: TicketService

  @Autowired
  private lateinit var properties: Properties

  @Autowired
  private lateinit var databaseTest: DatabaseTest

  @MockBean
  private lateinit var fsServiceMock: FilmstadenService

  @BeforeEach
  internal fun setUp() {
    properties.enableReassignment = false
  }

  @Test
  @WithLoggedInUser
  internal fun `given a showing, when processTickets() but the current user isn't the admin, then an exception is thrown`() {
    databaseTest.start {
      withShowing()
      afterInsert {
        assertThrows<AccessDeniedException> {
          ticketService.processTickets(listOf("notAnUrl"), showing.id)
        }
      }
    }
  }

  @Test
  @WithLoggedInUser
  internal fun `given a list of malformed filmstaden urls, when processTickets(), then an exception is thrown`() {
    databaseTest.start {
      withShowing(currentLoggedInUser().id)
      afterInsert {
        assertThrows<FilmstadenTicketException> {
          ticketService.processTickets(listOf("notAnUrl"), showing.id)
        }
      }
    }
  }

  @Test
  @WithLoggedInUser
  internal fun `given a showing with info not matching the tickets, when processTickets(), then the showing is updated to match the ticket info`() {
    databaseTest.start {
      withShowing(currentLoggedInUser().id)
      afterInsert {
        assertThat(showing.filmstadenShowingId).isNotNull()
        val time = Instant.now()
        val show = rnd.nextObject(FilmstadenShowDTO::class.java).copy(timeUtc = time)
        `when`(fsServiceMock.fetchFilmstadenShow("AA-1036-201908221930"))
          .thenReturn(show)

        val ticketUrl = "https://www.filmstaden.se/bokning/mina-e-biljetter/Sys99-SE/AA-1036-201908221930/RE-99RBBT0ZP6"
        ticketService.processTickets(listOf(ticketUrl), showing.id)

        val dbShowing = it.showingDao.findById(showing.id)
        assertThat(dbShowing?.cinemaScreen).isNotNull.isEqualTo(CinemaScreenDTO.from(show.screen))
        assertThat(dbShowing?.location?.name).isNotNull().isEqualTo(show.cinema.title)

        val zonedDateTime = time.atZone(ZoneId.of("Europe/Stockholm"))
        assertThat(dbShowing?.date).isNotNull().isEqualTo(zonedDateTime.toLocalDate())
        assertThat(dbShowing?.time).isNotNull().isEqualTo(zonedDateTime.toLocalTime())
        assertThat(dbShowing?.lastModifiedDate).isAfter(showing.lastModifiedDate)

        assertThat(dbShowing)
          .isEqualToIgnoringGivenFields(
            showing,
            "cinemaScreen",
            "time",
            "date",
            "location",
            "lastModifiedDate",
            "movieTitle",
            "payToPhone",
            "createdDate"
          )
      }
    }
  }

  @Test
  @WithLoggedInUser
  internal fun `given a showing with two attendees and tickets have random profile ids, when processTickets(), then the tickets are all assigned to the admin`() {
    databaseTest.start {
      withShowing(currentLoggedInUser().id)
      withAttendeesOnLastShowing()
      afterInsert {
        properties.enableReassignment = false
        val time = Instant.now()
        val show = rnd.nextObject(FilmstadenShowDTO::class.java).copy(timeUtc = time)
        `when`(fsServiceMock.fetchFilmstadenShow("AA-1036-201908221930"))
          .thenReturn(show)

        val tickets = (0..2).map { rnd.nextObject(FilmstadenTicketDTO::class.java) }
        `when`(fsServiceMock.fetchTickets("Sys99-SE", "AA-1036-201908221930", "RE-99RBBT0ZP6"))
          .thenReturn(tickets)
        `when`(fsServiceMock.fetchBarcode(ArgumentMatchers.anyString()))
          .thenReturn(rnd.nextObject(String::class.java))


        val ticketUrl = "https://www.filmstaden.se/bokning/mina-e-biljetter/Sys99-SE/AA-1036-201908221930/RE-99RBBT0ZP6"
        val dbTickets = ticketService.processTickets(listOf(ticketUrl), showing.id)

        assertThat(dbTickets).hasSize(3)
        assertThat(dbTickets.map(TicketDTO::assignedToUser))
          .containsOnly(showing.admin)
      }
    }
  }

  @Test
  @WithLoggedInUser
  internal fun `given a showing with two attendees and tickets have random profile ids, when enableReassignment is true and processTickets(), then the tickets are assigned to users without tickets`() {
    databaseTest.start {
      withShowing(currentLoggedInUser().id)
      withAttendeesOnLastShowing()
      afterInsert {
        properties.enableReassignment = true
        val time = Instant.now()
        val show = rnd.nextObject(FilmstadenShowDTO::class.java).copy(timeUtc = time)
        `when`(fsServiceMock.fetchFilmstadenShow("AA-1036-201908221930"))
          .thenReturn(show)

        val tickets = (0..2).map { rnd.nextObject(FilmstadenTicketDTO::class.java) }
        `when`(fsServiceMock.fetchTickets("Sys99-SE", "AA-1036-201908221930", "RE-99RBBT0ZP6"))
          .thenReturn(tickets)
        `when`(fsServiceMock.fetchBarcode(ArgumentMatchers.anyString()))
          .thenReturn(rnd.nextObject(String::class.java))


        val ticketUrl = "https://www.filmstaden.se/bokning/mina-e-biljetter/Sys99-SE/AA-1036-201908221930/RE-99RBBT0ZP6"
        val dbTickets = ticketService.processTickets(listOf(ticketUrl), showing.id)

        assertThat(tickets).hasSize(3)
        assertThat(dbTickets).describedAs("tickets for admin").hasSize(2)

        val allTickets = it.ticketDao.findByShowing(showing.id)
        assertThat(allTickets.filter { it.assignedToUser == showing.admin }).describedAs("Admin assigned tickets")
          .hasSize(2)
        assertThat(allTickets.filter { it.assignedToUser == user.id }).describedAs("User assigned tickets").hasSize(1)
      }
    }
  }

  @Test
  @WithLoggedInUser
  internal fun `given a showing with three attendees and two tickets that have correct profile ids, when enableReassignment is true and processTickets(), then the tickets are assigned to the correct users`() {
    databaseTest.start {
      withShowing(currentLoggedInUser().id)
      withAttendee { it.nextAttendee(currentLoggedInUser().id, showing.id) }
      withAttendeesOnLastShowing()
      withAttendeesOnLastShowing()
      afterInsert {
        properties.enableReassignment = true
        val time = Instant.now()
        val show = rnd.nextObject(FilmstadenShowDTO::class.java).copy(timeUtc = time)
        `when`(fsServiceMock.fetchFilmstadenShow("AA-1036-201908221930"))
          .thenReturn(show)

        val tickets = users.values.filter { it.id != currentLoggedInUser().id }
          .map { rnd.nextObject(FilmstadenTicketDTO::class.java).copy(profileId = it.filmstadenMembershipId?.value) }

        `when`(fsServiceMock.fetchTickets("Sys99-SE", "AA-1036-201908221930", "RE-99RBBT0ZP6"))
          .thenReturn(tickets)
        `when`(fsServiceMock.fetchBarcode(ArgumentMatchers.anyString()))
          .thenReturn(rnd.nextObject(String::class.java))


        val ticketUrl = "https://www.filmstaden.se/bokning/mina-e-biljetter/Sys99-SE/AA-1036-201908221930/RE-99RBBT0ZP6"
        val dbTickets = ticketService.processTickets(listOf(ticketUrl), showing.id)

        assertThat(tickets).hasSize(2)
        assertThat(dbTickets).describedAs("tickets for admin").hasSize(0)

        val allTickets = it.ticketDao.findByShowing(showing.id)
        users.values.filter { it.id != currentLoggedInUser().id }
          .forEach { u ->
            assertThat(allTickets.filter { it.assignedToUser == u.id }).describedAs("User assigned tickets").hasSize(1)
          }
        assertThat(allTickets.filter { it.assignedToUser == showing.admin }).describedAs("Admin assigned tickets")
          .hasSize(0)
      }
    }
  }

  @Test
  @WithLoggedInUser
  internal fun `given a showing with a attendee, when processTickets(), then the ticket saved are copied from the filmstaden ticket`() {
    databaseTest.start {
      withShowing(currentLoggedInUser().id)
      withAttendee { it.nextAttendee(currentLoggedInUser().id, showing.id) }
      afterInsert {
        val time = Instant.now()
        val show = rnd.nextObject(FilmstadenShowDTO::class.java).copy(timeUtc = time)
        `when`(fsServiceMock.fetchFilmstadenShow("AA-1036-201908221930"))
          .thenReturn(show)

        val ticket = rnd.nextObject(FilmstadenTicketDTO::class.java)

        `when`(fsServiceMock.fetchTickets("Sys99-SE", "AA-1036-201908221930", "RE-99RBBT0ZP6"))
          .thenReturn(listOf(ticket))
        val barcode = rnd.nextObject(String::class.java)
        `when`(fsServiceMock.fetchBarcode(ArgumentMatchers.anyString()))
          .thenReturn(barcode)


        val ticketUrl = "https://www.filmstaden.se/bokning/mina-e-biljetter/Sys99-SE/AA-1036-201908221930/RE-99RBBT0ZP6"
        val dbTickets = ticketService.processTickets(listOf(ticketUrl), showing.id)

        assertThat(dbTickets).describedAs("tickets for admin").hasSize(1)

        val dbTicket = dbTickets.first()
        assertThat(dbTicket.id).isEqualTo(ticket.id)
        assertThat(dbTicket.attributes).containsExactlyInAnyOrderElementsOf(ticket.show.attributes.map { it.displayName }.toSet())
        assertThat(dbTicket.barcode).isEqualTo(barcode)
        assertThat(dbTicket.cinema).isEqualTo(ticket.cinema.title)
        assertThat(dbTicket.cinemaCity).isEqualTo(ticket.cinema.city.name)
        assertThat(dbTicket.customerType).isEqualTo(ticket.customerType)
        assertThat(dbTicket.customerTypeDefinition).isEqualTo(ticket.customerTypeDefinition)
        assertThat(dbTicket.date).isEqualTo(ticket.show.date)
        assertThat(dbTicket.time).isEqualTo(ticket.show.time)
        assertThat(dbTicket.movieName).isEqualTo(ticket.movie.title)
        assertThat(dbTicket.movieRating).isEqualTo(ticket.movie.rating.displayName)
        assertThat(dbTicket.profileId).isEqualTo(ticket.profileId)
        assertThat(dbTicket.screen).isEqualTo(ticket.screen.title)
        assertThat(dbTicket.seatNumber).isEqualTo(ticket.seat.number)
        assertThat(dbTicket.seatRow).isEqualTo(ticket.seat.row)
        assertThat(dbTicket.showingId).isEqualTo(showing.id)
      }
    }
  }

  @Test
  @WithLoggedInUser
  internal fun `given a showing, when current user isn't a attendee and fetchSeatMap(), then null is returned`() {
    databaseTest.start {
      withShowing(currentLoggedInUser().id)
      withAttendeesOnLastShowing()
      afterInsert {
        val seatMap = ticketService.getTicketRange(showing.id)
        assertThat(seatMap).describedAs("seat map").isNull()
      }
    }
  }

  @Test
  @WithLoggedInUser
  internal fun `given a showing and no tickets, when fetchSeatMap(), then an empty ticket range is returned`() {
    databaseTest.start {
      withShowing(currentLoggedInUser().id)
      withAttendee { it.nextAttendee(currentLoggedInUser().id, showing.id) }
      afterInsert {
        val seatMap = ticketService.getTicketRange(showing.id)
        assertThat(seatMap).describedAs("seat map")
          .isEqualTo(TicketRange(listOf(), listOf(), 0))
      }
    }
  }

  @Test
  @WithLoggedInUser
  internal fun `given a showing and 3 tickets on same row, when fetchSeatMap(), then the seat map matching the tickets are returned`() {
    databaseTest.start {
      withShowing(currentLoggedInUser().id)
      withAttendee { it.nextAttendee(currentLoggedInUser().id, showing.id) }
      withTicket { it.nextTicket(showing.id, currentLoggedInUser().id).copy(seatRow = 5, seatNumber = 5) }
      withTicket { it.nextTicket(showing.id, currentLoggedInUser().id).copy(seatRow = 5, seatNumber = 6) }
      withTicket { it.nextTicket(showing.id, currentLoggedInUser().id).copy(seatRow = 5, seatNumber = 7) }
      afterInsert {
        val seatMap = ticketService.getTicketRange(showing.id)
        assertThat(seatMap).describedAs("seat map")
          .isEqualTo(TicketRange(listOf(5), listOf(SeatRange(5, listOf(5, 6, 7))), 3))
      }
    }
  }

  @Test
  @WithLoggedInUser
  internal fun `given a showing and 3 tickets on 3 rows, when fetchSeatMap(), then the seat map matching the tickets are returned`() {
    databaseTest.start {
      withShowing(currentLoggedInUser().id)
      withAttendee { it.nextAttendee(currentLoggedInUser().id, showing.id) }
      withTicket { it.nextTicket(showing.id, currentLoggedInUser().id).copy(seatRow = 5, seatNumber = 5) }
      withTicket { it.nextTicket(showing.id, currentLoggedInUser().id).copy(seatRow = 5, seatNumber = 6) }
      withTicket { it.nextTicket(showing.id, currentLoggedInUser().id).copy(seatRow = 5, seatNumber = 7) }
      withTicket { it.nextTicket(showing.id, currentLoggedInUser().id).copy(seatRow = 6, seatNumber = 5) }
      withTicket { it.nextTicket(showing.id, currentLoggedInUser().id).copy(seatRow = 6, seatNumber = 6) }
      withTicket { it.nextTicket(showing.id, currentLoggedInUser().id).copy(seatRow = 6, seatNumber = 7) }
      afterInsert {
        val seatMap = ticketService.getTicketRange(showing.id)
        assertThat(seatMap).describedAs("seat map")
          .isEqualTo(TicketRange(listOf(5, 6), listOf(SeatRange(5, listOf(5, 6, 7)), SeatRange(6, listOf(5, 6, 7))), 6))
      }
    }
  }
}