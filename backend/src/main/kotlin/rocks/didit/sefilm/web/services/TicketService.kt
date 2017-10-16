package rocks.didit.sefilm.web.services

import org.springframework.stereotype.Component
import rocks.didit.sefilm.clients.SfClient
import rocks.didit.sefilm.database.entities.Seat
import rocks.didit.sefilm.database.entities.Showing
import rocks.didit.sefilm.database.entities.Ticket
import rocks.didit.sefilm.database.repositories.TicketRepository
import rocks.didit.sefilm.database.repositories.UserRepository
import rocks.didit.sefilm.domain.SfMembershipId
import rocks.didit.sefilm.domain.UserID
import rocks.didit.sefilm.domain.dto.SfTicketDTO
import java.util.*

@Component
class TicketService(private val sfClient: SfClient,
                    private val userRepository: UserRepository,
                    private val ticketRepository: TicketRepository) {

  fun processTickets(userSuppliedTicketUrl: List<String>, showing: Showing) {
    userSuppliedTicketUrl.forEach {
      processTicketUrl(it, showing)
    }
  }

  private fun processTicketUrl(userSuppliedTicketUrl: String, showing: Showing) {
    val (sysId, sfShowingId, ticketId) = extractIdsFromUrl(userSuppliedTicketUrl)
    val sfTickets = sfClient.fetchTickets(sysId, sfShowingId, ticketId)

    val tickets = sfTickets.map {
      val barcode = sfClient.fetchBarcode(it.id)
      if (it.profileId == null || it.profileId.isBlank()) {
        return@map it.toTicket(showing.id, showing.admin, barcode)
      }

      val userIdForThatMember = userRepository
        .findBySfMembershipId(SfMembershipId(it.profileId))
        ?.id
        ?: showing.admin
      it.toTicket(showing.id, userIdForThatMember, barcode)

    }

    ticketRepository.saveAll(tickets)
  }

  private fun extractIdsFromUrl(userSuppliedTicketUrl: String): Triple<String, String, String> {
    val parts = userSuppliedTicketUrl.split('/')
    val ids = parts.subList(parts.size - 3, parts.size)
    if (ids.size != 3) {
      throw IllegalArgumentException("$userSuppliedTicketUrl does not contain three ids.")
    }
    return Triple(ids[0], ids[1], ids[2])
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
      barcode = barcode, profileId = this.profileId)
  }
}