@file:Suppress("unused")

package rocks.didit.sefilm.graphql

import com.coxautodev.graphql.tools.GraphQLQueryResolver
import com.coxautodev.graphql.tools.GraphQLResolver
import org.springframework.stereotype.Component
import rocks.didit.sefilm.NotFoundException
import rocks.didit.sefilm.database.dao.ParticipantDao
import rocks.didit.sefilm.domain.dto.AdminPaymentDetailsDTO
import rocks.didit.sefilm.domain.dto.AttendeePaymentDetailsDTO
import rocks.didit.sefilm.domain.dto.FilmstadenSeatMapDTO
import rocks.didit.sefilm.domain.dto.PublicUserDTO
import rocks.didit.sefilm.domain.dto.TicketRange
import rocks.didit.sefilm.domain.dto.core.MovieDTO
import rocks.didit.sefilm.domain.dto.core.ParticipantDTO
import rocks.didit.sefilm.domain.dto.core.ShowingDTO
import rocks.didit.sefilm.domain.dto.core.TicketDTO
import rocks.didit.sefilm.domain.id.Base64ID
import rocks.didit.sefilm.domain.id.FilmstadenShowingID
import rocks.didit.sefilm.domain.id.MovieID
import rocks.didit.sefilm.domain.id.ShowingID
import rocks.didit.sefilm.orElseThrow
import rocks.didit.sefilm.services.MovieService
import rocks.didit.sefilm.services.ShowingService
import rocks.didit.sefilm.services.TicketService
import rocks.didit.sefilm.services.UserService
import java.time.LocalDate

@Component
class ShowingQueryResolver(private val showingService: ShowingService) : GraphQLQueryResolver {
  fun publicShowings(afterDate: LocalDate?) = showingService.getShowingsAfterDate(afterDate ?: LocalDate.MIN)

  fun showing(id: ShowingID?, webId: Base64ID?): ShowingDTO? {
    return when {
      id != null -> showingService.getShowing(id)
      webId != null -> showingService.getShowing(webId)
      else -> null
    }
  }

  fun showing(webId: Base64ID): ShowingDTO? = showingService.getShowing(webId)
  fun showingForMovie(movieId: MovieID) = showingService.getShowingByMovie(movieId)
}

@Component
class ShowingResolver(
  private val showingService: ShowingService,
  private val participantDao: ParticipantDao,
  private val userService: UserService,
  private val movieService: MovieService,
  private val ticketService: TicketService
) : GraphQLResolver<ShowingDTO> {
  fun admin(showing: ShowingDTO): PublicUserDTO = userService
    .getUser(showing.admin)
    .orElseThrow { NotFoundException("admin user", showing.admin, showing.id) }

  fun payToUser(showing: ShowingDTO): PublicUserDTO = userService
    .getUser(showing.payToUser)
    .orElseThrow { NotFoundException("payment receiver user", showing.payToUser, showing.id) }

  fun movie(showing: ShowingDTO): MovieDTO = movieService.getMovieOrThrow(showing.movieId)

  fun participants(showing: ShowingDTO): List<ParticipantDTO> =
    participantDao.findAllParticipants(showing.id)

  // FIXME: remove and rename this to filmstadenShowingId instead
  fun filmstadenRemoteEntityId(showing: ShowingDTO): FilmstadenShowingID? = showing.filmstadenShowingId

  fun myTickets(showing: ShowingDTO): List<TicketDTO> = ticketService.getTicketsForCurrentUserAndShowing(showing.id)

  fun ticketRange(showing: ShowingDTO): TicketRange? = ticketService.getTicketRange(showing.id)

  fun adminPaymentDetails(showing: ShowingDTO): AdminPaymentDetailsDTO? =
    showingService.getAdminPaymentDetails(showing.id)

  fun attendeePaymentDetails(showing: ShowingDTO): AttendeePaymentDetailsDTO? =
    showingService.getAttendeePaymentDetails(showing.id)

  fun filmstadenSeatMap(showing: ShowingDTO): List<FilmstadenSeatMapDTO> = showingService.fetchSeatMap(showing.id)
}

@Component
class ParticipantUserResolver(private val userService: UserService, private val showingService: ShowingService) :
  GraphQLResolver<ParticipantDTO> {
  fun user(participant: ParticipantDTO): PublicUserDTO = userService
    .getUserOrThrow(participant.userId)

  // TODO: why is this needed?
  fun id(participant: ParticipantDTO) = participant.userId

  // TODO: why is this needed?
  fun showing(participant: ParticipantDTO) = showingService.getShowingOrThrow(participant.showingId)
}

@Component
class TicketUserResolver(private val userService: UserService) : GraphQLResolver<TicketDTO> {
  fun assignedToUser(ticket: TicketDTO): PublicUserDTO = userService.getUserOrThrow(ticket.assignedToUser)
}

