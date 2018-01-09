@file:Suppress("unused")

package rocks.didit.sefilm.graphql

import com.coxautodev.graphql.tools.GraphQLQueryResolver
import com.coxautodev.graphql.tools.GraphQLResolver
import org.springframework.stereotype.Component
import rocks.didit.sefilm.NotFoundException
import rocks.didit.sefilm.database.entities.Movie
import rocks.didit.sefilm.database.entities.Ticket
import rocks.didit.sefilm.domain.ParticipantDTO
import rocks.didit.sefilm.domain.dto.*
import rocks.didit.sefilm.orElseThrow
import rocks.didit.sefilm.services.MovieService
import rocks.didit.sefilm.services.ShowingService
import rocks.didit.sefilm.services.TicketService
import rocks.didit.sefilm.services.UserService
import java.time.LocalDate
import java.util.*

@Component
class ShowingQueryResolver(private val showingService: ShowingService) : GraphQLQueryResolver {
  fun publicShowings(afterDate: LocalDate?) = showingService.getAllPublicShowings(afterDate ?: LocalDate.MIN)
  fun privateShowingsForCurrentUser(afterDate: LocalDate?) = showingService.getPrivateShowingsForCurrentUser(afterDate ?: LocalDate.MIN)
  fun showing(id: UUID): ShowingDTO? = showingService.getShowing(id)
  fun showingForMovie(movieId: UUID) = showingService.getShowingByMovie(movieId)
}

@Component
class ShowingResolver(
  private val showingService: ShowingService,
  private val userService: UserService,
  private val movieService: MovieService,
  private val ticketService: TicketService) : GraphQLResolver<ShowingDTO> {
  fun admin(showing: ShowingDTO): LimitedUserDTO
    = userService
    .getUser(showing.admin)
    .orElseThrow { NotFoundException("admin user", showing.admin, showing.id) }

  fun payToUser(showing: ShowingDTO): LimitedUserDTO
    = userService
    .getUser(showing.payToUser)
    .orElseThrow { NotFoundException("payment receiver user", showing.payToUser, showing.id) }

  fun movie(showing: ShowingDTO): Movie {
    val id = showing.movieId
    return movieService.getMovie(id)
      .orElseThrow { NotFoundException("movie with id: ${showing.movieId}") }
  }

  fun myTickets(showing: ShowingDTO): List<Ticket>
    = ticketService.getTicketsForCurrentUserAndShowing(showing.id)

  fun ticketRange(showing: ShowingDTO): TicketRange?
    = ticketService.getTicketRange(showing.id)

  fun adminPaymentDetails(showing: ShowingDTO): AdminPaymentDetailsDTO?
    = showingService.getAdminPaymentDetails(showing.id)

  fun attendeePaymentDetails(showing: ShowingDTO): AttendeePaymentDetailsDTO?
    = showingService.getAttendeePaymentDetails(showing.id)
}

@Component
class ParticipantUserResolver(private val userService: UserService) : GraphQLResolver<ParticipantDTO> {
  fun user(participant: ParticipantDTO): LimitedUserDTO
    = userService
    .getUserOrThrow(participant.userId)
}

@Component
class TicketUserResolver(private val userService: UserService) : GraphQLResolver<Ticket> {
  fun assignedToUser(ticket: Ticket): LimitedUserDTO
    = userService
    .getUserOrThrow(ticket.assignedToUser)
}

@Component
class SfDataUserResolver(private val userService: UserService) : GraphQLResolver<UserAndSfData> {
  fun user(data: UserAndSfData): LimitedUserDTO
    = userService
    .getUserOrThrow(data.userId)
}
