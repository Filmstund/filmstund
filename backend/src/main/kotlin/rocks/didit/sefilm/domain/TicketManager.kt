package rocks.didit.sefilm.domain

import org.springframework.stereotype.Component
import rocks.didit.sefilm.SfTicketException
import rocks.didit.sefilm.clients.SfClient
import rocks.didit.sefilm.database.entities.Seat
import rocks.didit.sefilm.database.entities.Showing
import rocks.didit.sefilm.database.entities.Ticket
import rocks.didit.sefilm.database.repositories.TicketRepository
import rocks.didit.sefilm.domain.dto.SfTicketDTO
import java.net.URI
import java.util.*

@Component
class TicketManager(private val sfClient: SfClient,
                    private val ticketRepository: TicketRepository) {

  fun processTickets(userSuppliedTicketUrl: URI, showing: Showing) {
    val parts = userSuppliedTicketUrl.path.split('/')
    val ids = parts.subList(parts.size - 3, parts.size)
    val sfTickets = sfClient.fetchTickets(ids[0], ids[1], ids[2])

    if (showing.participants.size != sfTickets.size) {
      throw SfTicketException("Ticket mismatch: Showing (${showing.id}) has ${showing.participants.size} participants, but SF supplied ${sfTickets.size} tickets")
    }

    val tickets = showing.participants.mapIndexed { index, participant ->
      val barcode = sfClient.fetchBarcode(sfTickets[index].id)
      sfTickets[index].toTicket(showing.id, participant.extractUserId(), barcode)
    }
    ticketRepository.saveAll(tickets)
  }

  fun deleteTickets(showing: Showing) {
    val ticketsForShowing = ticketRepository.findByShowingId(showingId = showing.id)
    ticketRepository.deleteAll(ticketsForShowing)
  }

  private fun SfTicketDTO.toTicket(showingId: UUID, assignedToUser: UserID, barcode: String): Ticket {
    val seat = Seat(this.seat.row, this.seat.number)
    return Ticket(id = this.id, showingId = showingId, assignedToUser = assignedToUser,
      customerType = this.customerType, customerTypeDefinition = this.customerTypeDefinition, cinema = this.cinema.title,
      cinemaCity = this.cinema.city.name, screen = this.screen.title, seat = seat, date = this.show.date, time = this.show.time,
      movieName = this.movie.title, movieRating = this.movie.rating.displayName, showAttributes = this.show.attributes.map { it.displayName },
      barcode = barcode)
  }
}