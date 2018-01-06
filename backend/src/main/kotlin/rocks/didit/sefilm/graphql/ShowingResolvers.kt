@file:Suppress("unused")

package rocks.didit.sefilm.graphql

import com.coxautodev.graphql.tools.GraphQLQueryResolver
import com.coxautodev.graphql.tools.GraphQLResolver
import org.springframework.stereotype.Component
import rocks.didit.sefilm.NotFoundException
import rocks.didit.sefilm.database.entities.Movie
import rocks.didit.sefilm.database.entities.Showing
import rocks.didit.sefilm.database.entities.Ticket
import rocks.didit.sefilm.domain.Participant
import rocks.didit.sefilm.domain.PaymentType
import rocks.didit.sefilm.domain.dto.*
import rocks.didit.sefilm.orElseThrow
import rocks.didit.sefilm.redact
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
  fun showing(id: UUID): Showing? = showingService.getShowing(id)
  fun showingForMovie(movieId: UUID) = showingService.getShowingByMovie(movieId)
}

@Component
class ShowingResolver(
  private val showingService: ShowingService,
  private val userService: UserService,
  private val movieService: MovieService,
  private val ticketService: TicketService) : GraphQLResolver<Showing> {
  fun admin(showing: Showing): LimitedUserDTO
    = userService
    .getUser(showing.admin)
    .orElseThrow { NotFoundException("admin user", showing.admin, showing.id) }

  fun payToUser(showing: Showing): LimitedUserDTO
    = userService
    .getUser(showing.payToUser)
    .orElseThrow { NotFoundException("payment receiver user", showing.payToUser, showing.id) }

  fun movie(showing: Showing): Movie {
    val id = showing.movieId ?: UUID.randomUUID()
    return movieService.getMovie(id)
      .orElseThrow { NotFoundException("movie with id: ${showing.movieId}") }
  }

  fun myTickets(showing: Showing): List<Ticket>
    = ticketService.getTicketsForCurrentUserAndShowing(showing.id)

  fun ticketRange(showing: Showing): TicketRange
    = ticketService.getTicketRange(showing.id)

  fun preBuyInfo(showing: Showing): PreBuyInfoDTO
    = showingService.getPreBuyInfo(showing.id)

  fun paymentInfo(showing: Showing): PaymentDTO
    = showingService.getPaymentInfo(showing.id)
}

@Component
class ParticipantUserResolver(private val userService: UserService) : GraphQLResolver<Participant> {
  fun user(participant: Participant): LimitedUserDTO
    = userService
    .getUserOrThrow(participant.extractUserId())

  fun paymentType(participant: Participant): PaymentType = participant.redact().paymentType
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
