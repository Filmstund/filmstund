package rocks.didit.sefilm.services

import org.springframework.security.access.AccessDeniedException
import org.springframework.stereotype.Component
import rocks.didit.sefilm.NotFoundException
import rocks.didit.sefilm.SfTicketException
import rocks.didit.sefilm.UserHasNotPaidException
import rocks.didit.sefilm.currentLoggedInUser
import rocks.didit.sefilm.database.entities.Seat
import rocks.didit.sefilm.database.entities.Showing
import rocks.didit.sefilm.database.entities.Ticket
import rocks.didit.sefilm.database.repositories.ParticipantPaymentInfoRepository
import rocks.didit.sefilm.database.repositories.ShowingRepository
import rocks.didit.sefilm.database.repositories.TicketRepository
import rocks.didit.sefilm.database.repositories.UserRepository
import rocks.didit.sefilm.domain.SfMembershipId
import rocks.didit.sefilm.domain.UserID
import rocks.didit.sefilm.domain.dto.SfTicketDTO
import rocks.didit.sefilm.domain.dto.TicketRange
import java.util.*

@Component
class TicketService(private val sfClient: SFService,
                    private val userRepository: UserRepository,
                    private val ticketRepository: TicketRepository,
                    private val showingRepository: ShowingRepository,
                    private val paymentInfoRepository: ParticipantPaymentInfoRepository) {

  fun getTicketsForCurrentUserAndShowing(showingId: UUID): List<Ticket> {
    val user = currentLoggedInUser()
    assertPaidAndEnrolled(showingId, user)
    return ticketRepository.findByShowingIdAndAssignedToUser(showingId, user)
  }

  fun processTickets(userSuppliedTicketUrl: List<String>, showingId: UUID): List<Ticket> {
    val currentLoggedInUser = currentLoggedInUser()
    val showing = showingRepository.findById(showingId)
      .orElseThrow { NotFoundException("showing with id $showingId") }

    if (showing.admin != currentLoggedInUser) {
      throw AccessDeniedException("Only the showing admin is allowed to do that")
    }

    validateSfTicketUrls(userSuppliedTicketUrl)
    userSuppliedTicketUrl.forEach {
      processTicketUrl(it, showing)
    }

    return getTicketsForCurrentUserAndShowing(showingId)
  }

  private fun processTicketUrl(userSuppliedTicketUrl: String, showing: Showing) {
    val (sysId, sfShowingId, ticketId) = extractIdsFromUrl(userSuppliedTicketUrl)
    val sfTickets = sfClient.fetchTickets(sysId, sfShowingId, ticketId)

    val tickets = sfTickets.map {
      val barcode = sfClient.fetchBarcode(it.id)
      if (it.profileId == null || it.profileId.isBlank()) {
        return@map it.toTicket(showing.id, showing.admin, barcode)
      }

      val userIdForThatMember = getUserIdFromSfMembershipId(SfMembershipId.valueOf(it.profileId), showing)
      it.toTicket(showing.id, userIdForThatMember, barcode)
    }

    ticketRepository.saveAll(tickets)
  }

  private fun getUserIdFromSfMembershipId(sfMembershipId: SfMembershipId, showing: Showing): UserID {
    val userIdForThatMember = userRepository
      .findBySfMembershipId(sfMembershipId)
      ?.id
      ?: return showing.admin

    if (showing.participants.any { it.hasUserId(userIdForThatMember) }) {
      return userIdForThatMember
    }

    return showing.admin
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

  fun getTicketRange(showingId: UUID): TicketRange {
    val currentLoggedInUser = currentLoggedInUser()
    assertPaidAndEnrolled(showingId, currentLoggedInUser)

    val allSeatsForShowing = ticketRepository.findByShowingId(showingId)
      .map { it.seat }
      .sortedBy { it.number }

    val rows = allSeatsForShowing
      .map { it.row }
      .distinct()
      .sorted()

    val groupedSeats = allSeatsForShowing.groupBy({ it.row }, { it.number })
    return TicketRange(rows, groupedSeats, allSeatsForShowing.size)
  }

  private fun SfTicketDTO.toTicket(showingId: UUID, assignedToUser: UserID, barcode: String): Ticket {
    val seat = Seat(this.seat.row, this.seat.number)
    return Ticket(id = this.id, showingId = showingId, assignedToUser = assignedToUser,
      customerType = this.customerType, customerTypeDefinition = this.customerTypeDefinition, cinema = this.cinema.title,
      cinemaCity = this.cinema.city.name, screen = this.screen.title, seat = seat, date = this.show.date, time = this.show.time,
      movieName = this.movie.title, movieRating = this.movie.rating.displayName, showAttributes = this.show.attributes.map { it.displayName },
      barcode = barcode, profileId = this.profileId)
  }

  private fun assertPaidAndEnrolled(showingId: UUID, currentLoggedInUser: UserID) {
    val participant = paymentInfoRepository
      .findByShowingIdAndUserId(showingId, currentLoggedInUser)
      .orElseThrow {
        throw NotFoundException("user. Not enrolled on this showing")
      }

    if (!participant.hasPaid) {
      throw UserHasNotPaidException("User has not paid for this showing")
    }
  }

  private fun validateSfTicketUrls(links: List<String>) {
    val linkRegex = Regex(".+sf\\.se/bokning/mina-e-biljetter/Sys.+?/AA.+?/RE.+")
    links.forEach {
      if (!it.matches(linkRegex)) {
        throw SfTicketException("$it does not look lika a valid ticket link. The link should look like this: https://www.sf.se/bokning/mina-e-biljetter/Sys99-SE/AA-1156-201712271800/RE-HPOUKRTI2N")
      }
    }
  }
}