package rocks.didit.sefilm.services

import org.springframework.security.access.AccessDeniedException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import rocks.didit.sefilm.FilmstadenTicketException
import rocks.didit.sefilm.NotFoundException
import rocks.didit.sefilm.Properties
import rocks.didit.sefilm.currentLoggedInUser
import rocks.didit.sefilm.database.entities.CinemaScreen
import rocks.didit.sefilm.database.entities.Showing
import rocks.didit.sefilm.database.entities.Ticket
import rocks.didit.sefilm.database.entities.TicketAttribute
import rocks.didit.sefilm.database.entities.TicketAttributeId
import rocks.didit.sefilm.database.repositories.ParticipantRepository
import rocks.didit.sefilm.database.repositories.ShowingRepository
import rocks.didit.sefilm.database.repositories.TicketRepository
import rocks.didit.sefilm.database.repositories.UserRepository
import rocks.didit.sefilm.domain.FilmstadenMembershipId
import rocks.didit.sefilm.domain.dto.FilmstadenTicketDTO
import rocks.didit.sefilm.domain.dto.SeatRange
import rocks.didit.sefilm.domain.dto.TicketRange
import rocks.didit.sefilm.domain.dto.toFilmstadenLiteScreen
import rocks.didit.sefilm.logger
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
  private val showingRepository: ShowingRepository,
  private val participantRepo: ParticipantRepository
) {
  private val log by logger()

  @Transactional
  fun getTicketsForCurrentUserAndShowing(showingId: UUID): List<Ticket> {
    return ticketRepository.findByShowingIdAndAssignedToUser_Id(showingId, currentLoggedInUser().id)
  }

  @Transactional
  fun processTickets(userSuppliedTicketUrl: List<String>, showingId: UUID): List<Ticket> {
    val currentLoggedInUserId = currentLoggedInUser().id
    val showing = showingRepository.findById(showingId)
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
    val adminAssignedTickets = ticketRepository.findByShowingAndAssignedToUser(showing, showing.admin)
    if (adminAssignedTickets.size > 1) {
      val allTickets = ticketRepository.findByShowing(showing)
      val participantsMissingTicket = showing.participants.filter { participant ->
        allTickets.none { ticket -> ticket.assignedToUser.id == participant.user.id }
      }

      adminAssignedTickets.subList(1, adminAssignedTickets.size)
        .zip(participantsMissingTicket)
        .forEach { (ticket, participant) ->
          ticket.assignedToUser = participant.user
        }
    }
  }

  private fun updateShowingFromTicketUrl(showing: Showing, ticketUrl: String) {
    val (_, filmstadenRemoteEntityId, _) = extractIdsFromUrl(ticketUrl)
    val fetchFilmstadenShow = filmstadenService.fetchFilmstadenShow(filmstadenRemoteEntityId)
    val location = locationService.getOrCreateNewLocation(fetchFilmstadenShow.cinema.title)
    val zonedDateTime = fetchFilmstadenShow.timeUtc.atZone(ZoneId.of("Europe/Stockholm"))
    val filmstadenLiteScreen = fetchFilmstadenShow.screen.toFilmstadenLiteScreen()

    showing.cinemaScreen = CinemaScreen(filmstadenLiteScreen.filmstadenId, filmstadenLiteScreen.name)
    showing.time = zonedDateTime.toLocalTime()
    showing.date = zonedDateTime.toLocalDate()
    //showing.location = location
  }

  private fun processTicketUrl(userSuppliedTicketUrl: String, showing: Showing) {
    val (sysId, filmstadenRemoteEntityId, ticketId) = extractIdsFromUrl(userSuppliedTicketUrl)
    val filmstadenTickets = filmstadenService.fetchTickets(sysId, filmstadenRemoteEntityId, ticketId)

    val tickets = filmstadenTickets.map {
      val barcode = filmstadenService.fetchBarcode(it.id)
      if (it.profileId.isNullOrBlank()) {
        return@map it.toTicket(showing.id, showing.admin.id, barcode)
      }

      val userIdForThatMember =
        getUserIdFromFilmstadenId(FilmstadenMembershipId.valueOf(it.profileId!!), showing)
      it.toTicket(showing.id, userIdForThatMember, barcode)
    }

    ticketRepository.saveAll(tickets)
  }

  private fun getUserIdFromFilmstadenId(filmstadenId: FilmstadenMembershipId, showing: Showing): UUID {
    val userIdForThatMember = userRepository.findUserIdByFilmstadenId(filmstadenId)
      ?: return showing.admin.id

    // Check so that we don't accidentally assign ticket to user not attending showing
    if (showing.participants.any { it.user.id == userIdForThatMember }) {
      return userIdForThatMember
    }

    return showing.admin.id
  }

  private fun extractIdsFromUrl(userSuppliedTicketUrl: String): Triple<String, String, String> {
    val parts = userSuppliedTicketUrl.split('/')
    val ids = parts.subList(parts.size - 3, parts.size)
    require(ids.size == 3) { "$userSuppliedTicketUrl does not contain three ids." }
    return Triple(ids[0], ids[1], ids[2])
  }

  @Transactional
  fun deleteTickets(showing: Showing) {
    val numDeletedTickets = ticketRepository.deleteAllByShowing(showing)
    log.info("Deleted {} tickets from showing {}", numDeletedTickets, showing.id)
  }

  fun getTicketRange(showingId: UUID): TicketRange? {
    val currentLoggedInUser = currentLoggedInUser()
    if (!isUserIsParticipant(showingId, currentLoggedInUser.id)) {
      return null
    }

    val allSeatsForShowing = ticketRepository.findByShowing_Id(showingId)
      .map { Seat(it.seatRow, it.seatNumber) }
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

  private fun FilmstadenTicketDTO.toTicket(showingId: UUID, assignedToUser: UUID, barcode: String): Ticket {
    val ticket = Ticket(
      id = this.id,
      showing = showingRepository.getOne(showingId),
      assignedToUser = userRepository.getOne(assignedToUser),
      customerType = this.customerType,
      customerTypeDefinition = this.customerTypeDefinition,
      cinema = this.cinema.title,
      cinemaCity = this.cinema.city.name,
      screen = this.screen.title,
      seatNumber = this.seat.number,
      seatRow = this.seat.number,
      date = this.show.date,
      time = this.show.time,
      movieName = this.movie.title,
      movieRating = this.movie.rating.displayName,
      barcode = barcode,
      profileId = this.profileId
    )
    ticket.showAttributes.addAll(this.show.attributes.map {
      TicketAttribute(
        TicketAttributeId(
          ticket,
          it.displayName
        )
      )
    })

    return ticket
  }

  private fun isUserIsParticipant(showingId: UUID, currentLoggedInUser: UUID): Boolean {
    return participantRepo.existsById_Showing_IdAndId_User_Id(showingId, currentLoggedInUser)
  }

  private fun validateFilmstadenTicketUrls(links: List<String>) {
    val linkRegex = Regex(".+filmstaden\\.se/bokning/mina-e-biljetter/Sys.+?/AA.+?/RE.+")
    links.forEach {
      if (!it.matches(linkRegex)) {
        throw FilmstadenTicketException("$it does not look like a valid ticket link. The link should look like this: https://www.filmstaden.se/bokning/mina-e-biljetter/Sys99-SE/AA-1036-201908221930/RE-99RBBT0ZP6")
      }
    }
  }

  data class Seat(val row: Int, val number: Int)
}