package rocks.didit.sefilm.services

import org.springframework.security.access.AccessDeniedException
import org.springframework.stereotype.Service
import rocks.didit.sefilm.FilmstadenTicketException
import rocks.didit.sefilm.NotFoundException
import rocks.didit.sefilm.Properties
import rocks.didit.sefilm.currentLoggedInUserId
import rocks.didit.sefilm.database.entities.Seat
import rocks.didit.sefilm.database.entities.Showing
import rocks.didit.sefilm.database.entities.Ticket
import rocks.didit.sefilm.database.repositories.ShowingRepository
import rocks.didit.sefilm.database.repositories.TicketRepository
import rocks.didit.sefilm.database.repositories.UserRepository
import rocks.didit.sefilm.domain.FilmstadenMembershipId
import rocks.didit.sefilm.domain.UserID
import rocks.didit.sefilm.domain.dto.FilmstadenTicketDTO
import rocks.didit.sefilm.domain.dto.SeatRange
import rocks.didit.sefilm.domain.dto.TicketRange
import rocks.didit.sefilm.domain.dto.toFilmstadenLiteScreen
import rocks.didit.sefilm.services.external.FilmstadenService
import java.time.ZoneId
import java.util.*

@Service
class TicketService(
  private val properties: Properties,
  private val filmstadenService: FilmstadenService,
  private val locationService: LocationService,
  private val userRepository: UserRepository,
  private val ticketRepository: TicketRepository,
  private val showingRepository: ShowingRepository
) {

  fun getTicketsForCurrentUserAndShowing(showingId: UUID): List<Ticket> {
    val user = currentLoggedInUserId()
    isUserIsParticipant(showingId, user)
    return ticketRepository.findByShowingIdAndAssignedToUser(showingId, user)
  }

  fun processTickets(userSuppliedTicketUrl: List<String>, showingId: UUID): List<Ticket> {
    val currentLoggedInUserId = currentLoggedInUserId()
    val showing =
      showingRepository.findById(showingId)
        .orElseThrow { NotFoundException("showing", currentLoggedInUserId, showingId) }

    if (showing.admin.id != currentLoggedInUserId) {
      throw AccessDeniedException("Only the showing admin is allowed to do that")
    }

    validateFilmstadenTicketUrls(userSuppliedTicketUrl)
    userSuppliedTicketUrl.firstOrNull()?.let { updateShowingFromTicketUrl(showing, it) }
    userSuppliedTicketUrl.forEach {
      processTicketUrl(it, showing)
    }

    if (properties.enableReassignment) {
      reassignLeftoverTickets(showing)
    }

    return getTicketsForCurrentUserAndShowing(showingId)
  }

  private fun reassignLeftoverTickets(showing: Showing) {
    val adminAssignedTickets = ticketRepository.findByShowingIdAndAssignedToUser(showing.id, showing.admin.id)
    if (adminAssignedTickets.size > 1) {
      val allTickets = ticketRepository.findByShowingId(showing.id)
      val participantsMissingTicket = showing.participants.filter { participant ->
        allTickets.none { ticket -> ticket.assignedToUser == participant.userId }
      }

      val reassigned = adminAssignedTickets.subList(1, adminAssignedTickets.size)
        .zip(participantsMissingTicket)
        .map { (ticket, participant) -> ticket.copy(assignedToUser = participant.userId) }
      ticketRepository.saveAll(reassigned)
    }
  }

  private fun updateShowingFromTicketUrl(showing: Showing, ticketUrl: String) {
    val (_, filmstadenRemoteEntityId, _) = extractIdsFromUrl(ticketUrl)
    val fetchFilmstadenShow = filmstadenService.fetchFilmstadenShow(filmstadenRemoteEntityId)
    val location = locationService.getOrCreateNewLocation(fetchFilmstadenShow.cinema.title)
    val zonedDateTime = fetchFilmstadenShow.timeUtc.atZone(ZoneId.of("Europe/Stockholm"))

    val updatedShowing = showing.copy(
      filmstadenScreen = fetchFilmstadenShow.screen.toFilmstadenLiteScreen(),
      time = zonedDateTime.toLocalTime(),
      date = zonedDateTime.toLocalDate(),
      location = location
    )

    showingRepository.save(updatedShowing)
  }

  private fun processTicketUrl(userSuppliedTicketUrl: String, showing: Showing) {
    val (sysId, filmstadenRemoteEntityId, ticketId) = extractIdsFromUrl(userSuppliedTicketUrl)
    val filmstadenTickets = filmstadenService.fetchTickets(sysId, filmstadenRemoteEntityId, ticketId)

    val tickets = filmstadenTickets.map {
      val barcode = filmstadenService.fetchBarcode(it.id)
      if (it.profileId == null || it.profileId.isBlank()) {
        return@map it.toTicket(showing.id, showing.admin.id, barcode)
      }

      val userIdForThatMember =
        getUserIdFromFilmstadenMembershipId(FilmstadenMembershipId.valueOf(it.profileId), showing)
      it.toTicket(showing.id, userIdForThatMember, barcode)
    }

    ticketRepository.saveAll(tickets)
  }

  private fun getUserIdFromFilmstadenMembershipId(
    filmstadenMembershipId: FilmstadenMembershipId,
    showing: Showing
  ): UserID {
    val userIdForThatMember = userRepository
      .findByFilmstadenMembershipId(filmstadenMembershipId)
      ?.id
      ?: return showing.admin.id

    if (showing.participants.any { it.userId == userIdForThatMember }) {
      return userIdForThatMember
    }

    return showing.admin.id
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

  fun getTicketRange(showingId: UUID): TicketRange? {
    val currentLoggedInUser = currentLoggedInUserId()
    if (!isUserIsParticipant(showingId, currentLoggedInUser)) {
      return null
    }

    val allSeatsForShowing = ticketRepository.findByShowingId(showingId)
      .map { it.seat }
      .sortedBy { it.number }

    val rows = allSeatsForShowing
      .map { it.row }
      .distinct()
      .sorted()

    val groupedSeats = allSeatsForShowing
      .groupBy({ it.row }, { it.number })
      .map { SeatRange(it.key, it.value) }
    return TicketRange(rows, groupedSeats, allSeatsForShowing.size)
  }

  private fun FilmstadenTicketDTO.toTicket(showingId: UUID, assignedToUser: UserID, barcode: String): Ticket {
    val seat = Seat(this.seat.row, this.seat.number)
    return Ticket(
      id = this.id,
      showingId = showingId,
      assignedToUser = assignedToUser,
      customerType = this.customerType,
      customerTypeDefinition = this.customerTypeDefinition,
      cinema = this.cinema.title,
      cinemaCity = this.cinema.city.name,
      screen = this.screen.title,
      seat = seat,
      date = this.show.date,
      time = this.show.time,
      movieName = this.movie.title,
      movieRating = this.movie.rating.displayName,
      showAttributes = this.show.attributes.map { it.displayName },
      barcode = barcode,
      profileId = this.profileId
    )
  }

  private fun isUserIsParticipant(showingId: UUID, currentLoggedInUser: UserID): Boolean {
    return showingRepository.findById(showingId)
      .orElseThrow { NotFoundException("showing", currentLoggedInUser, showingId) }
      .participants
      .any { it.userId == currentLoggedInUser }
  }

  private fun validateFilmstadenTicketUrls(links: List<String>) {
    val linkRegex = Regex(".+filmstaden\\.se/bokning/mina-e-biljetter/Sys.+?/AA.+?/RE.+")
    links.forEach {
      if (!it.matches(linkRegex)) {
        throw FilmstadenTicketException("$it does not look like a valid ticket link. The link should look like this: https://www.filmstaden.se/bokning/mina-e-biljetter/Sys99-SE/AA-1036-201908221930/RE-99RBBT0ZP6")
      }
    }
  }
}