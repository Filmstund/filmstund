package rocks.didit.sefilm.services

import org.jdbi.v3.core.Jdbi
import org.jdbi.v3.core.kotlin.inTransactionUnchecked
import org.jdbi.v3.sqlobject.kotlin.onDemand
import org.springframework.stereotype.Service
import rocks.didit.sefilm.Daos
import rocks.didit.sefilm.Properties
import rocks.didit.sefilm.currentLoggedInUser
import rocks.didit.sefilm.database.dao.TicketDao
import rocks.didit.sefilm.domain.dto.FilmstadenTicketDTO
import rocks.didit.sefilm.domain.dto.SeatRange
import rocks.didit.sefilm.domain.dto.TicketRange
import rocks.didit.sefilm.domain.dto.core.ShowingDTO
import rocks.didit.sefilm.domain.dto.core.TicketDTO
import rocks.didit.sefilm.domain.dto.toFilmstadenLiteScreen
import rocks.didit.sefilm.domain.id.FilmstadenMembershipId
import rocks.didit.sefilm.domain.id.ShowingID
import rocks.didit.sefilm.domain.id.UserID
import rocks.didit.sefilm.logger
import rocks.didit.sefilm.services.external.FilmstadenService
import rocks.didit.sefilm.toDaos
import java.time.ZoneId

@Service
class TicketService(
  private val jdbi: Jdbi,
  private val properties: Properties,
  private val filmstadenService: FilmstadenService,
  private val locationService: LocationService,
  private val assertionService: AssertionService
) {
  private val log by logger()

  fun getTicketsForCurrentUserAndShowing(showingId: ShowingID): List<TicketDTO> {
    return jdbi.onDemand<TicketDao>().findByUserAndShowing(currentLoggedInUser().id, showingId)
  }

  fun processTickets(userSuppliedTicketUrl: List<String>, showingId: ShowingID): List<TicketDTO> {
    require(userSuppliedTicketUrl.isNotEmpty()) { "Supply a list of ticket urls" }

    return jdbi.inTransactionUnchecked { handle ->
      val daos = handle.toDaos()

      val currentLoggedInUserId = currentLoggedInUser().id
      val showing = daos.showingDao.findByIdOrThrow(showingId)

      assertionService.assertLoggedInUserIsAdmin(showing)
      assertionService.validateFilmstadenTicketUrls(userSuppliedTicketUrl)

      val updatedShowing = matchShowingInfoWithTicket(daos, showing, userSuppliedTicketUrl.first())
      userSuppliedTicketUrl.forEach {
        processTicketUrl(daos, it, updatedShowing)
      }

      if (properties.enableReassignment) {
        reassignLeftoverTickets(daos, updatedShowing)
      }

      daos.ticketDao.findByUserAndShowing(currentLoggedInUserId, showingId)
    }
  }

  private fun reassignLeftoverTickets(daos: Daos, showing: ShowingDTO) {
    val adminAssignedTickets = daos.ticketDao.findByUserAndShowing(showing.admin, showing.id)
    if (adminAssignedTickets.size > 1) {
      val allTickets = daos.ticketDao.findByShowing(showing.id)
      val participants = daos.participantDao.findAllParticipants(showing.id)
      val participantsMissingTicket = participants.filter { participant ->
        allTickets.none { ticket -> ticket.assignedToUser == participant.userId }
      }

      adminAssignedTickets.subList(1, adminAssignedTickets.size)
        .zip(participantsMissingTicket)
        .forEach { (ticket, participant) ->
          log.info("Re-assigning ticket {} to {} (was assigned to {})", ticket.id, participant.userId, showing.admin)
          daos.ticketDao.reassignTicket(ticket.id, showing.admin, participant.userId)
        }
    }
  }

  /**
   * Make sure that the showing info matches the bought tickets, i.e. the time etc
   */
  private fun matchShowingInfoWithTicket(daos: Daos, showing: ShowingDTO, ticketUrl: String): ShowingDTO {
    val (_, filmstadenRemoteEntityId, _) = extractIdsFromUrl(ticketUrl)
    val fetchFilmstadenShow = filmstadenService.fetchFilmstadenShow(filmstadenRemoteEntityId)

    val location = locationService.getOrCreateNewLocation(fetchFilmstadenShow.cinema.title)
    val zonedDateTime = fetchFilmstadenShow.timeUtc.atZone(ZoneId.of("Europe/Stockholm"))
    val cinemaScreen = fetchFilmstadenShow.screen.toFilmstadenLiteScreen()
    daos.showingDao.maybeInsertCinemaScreen(cinemaScreen)

    val updatedShowing = showing.copy(
      cinemaScreen = cinemaScreen,
      time = zonedDateTime.toLocalTime(),
      date = zonedDateTime.toLocalDate(),
      location = location
    )
    daos.showingDao.updateShowing(updatedShowing, currentLoggedInUser().id)
    return updatedShowing
  }

  private fun processTicketUrl(daos: Daos, userSuppliedTicketUrl: String, showing: ShowingDTO) {
    val (sysId, filmstadenRemoteEntityId, ticketId) = extractIdsFromUrl(userSuppliedTicketUrl)
    val filmstadenTickets = filmstadenService.fetchTickets(sysId, filmstadenRemoteEntityId, ticketId)

    val tickets = filmstadenTickets.map {
      val barcode = filmstadenService.fetchBarcode(it.id)
      if (it.profileId.isNullOrBlank()) {
        return@map it.toTicket(showing.id, showing.admin, barcode)
      }

      val userIdForThatMember =
        getUserIdFromFilmstadenId(daos, FilmstadenMembershipId.valueOf(it.profileId!!), showing)
      it.toTicket(showing.id, userIdForThatMember, barcode)
    }

    daos.ticketDao.insertTickets(tickets)
  }

  private fun getUserIdFromFilmstadenId(daos: Daos, filmstadenId: FilmstadenMembershipId, showing: ShowingDTO): UserID {
    val userIdForThatMember = daos.userDao.findIdByFilmstadenId(filmstadenId)
      ?: return showing.admin

    // Check so that we don't accidentally assign ticket to user not attending showing
    if (!daos.participantDao.isParticipantOnShowing(userIdForThatMember, showing.id)) {
      return showing.admin
    }

    return userIdForThatMember
  }

  private fun extractIdsFromUrl(userSuppliedTicketUrl: String): Triple<String, String, String> {
    val parts = userSuppliedTicketUrl.split('/')
    val ids = parts.subList(parts.size - 3, parts.size)
    require(ids.size == 3) { "$userSuppliedTicketUrl does not contain three ids." }
    return Triple(ids[0], ids[1], ids[2])
  }

  fun getTicketRange(showingId: ShowingID): TicketRange? {
    return jdbi.inTransactionUnchecked { handle ->
      val daos = handle.toDaos()
      val currentLoggedInUser = currentLoggedInUser()
      if (!daos.participantDao.isParticipantOnShowing(currentLoggedInUser.id, showingId)) {
        return@inTransactionUnchecked null
      }

      val allSeatsForShowing = daos.ticketDao.findByShowing(showingId)
        .map { Seat(it.seatRow, it.seatNumber) }
        .sortedBy { it.number }

      val rows = allSeatsForShowing
        .map { it.row }
        .distinct()
        .sorted()

      val groupedSeats = allSeatsForShowing
        .groupBy({ it.row }, { it.number })
        .map { SeatRange(it.key, it.value) }
      TicketRange(rows, groupedSeats, allSeatsForShowing.size)

    }
  }

  private fun FilmstadenTicketDTO.toTicket(showingId: ShowingID, assignedToUser: UserID, barcode: String): TicketDTO {
    return TicketDTO(
      id = id,
      showingId = showingId,
      assignedToUser = assignedToUser,
      customerType = customerType,
      customerTypeDefinition = customerTypeDefinition,
      cinema = cinema.title,
      cinemaCity = cinema.city.name,
      screen = screen.title,
      seatNumber = seat.number,
      seatRow = seat.row,
      date = show.date,
      time = show.time,
      movieName = movie.title,
      movieRating = movie.rating.displayName,
      barcode = barcode,
      profileId = profileId,
      attributes = show.attributes.map { it.displayName }.toSet()
    )
  }

  data class Seat(val row: Int, val number: Int)
}