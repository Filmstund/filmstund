@file:Suppress("unused")

package se.filmstund.graphql

import com.coxautodev.graphql.tools.GraphQLQueryResolver
import com.coxautodev.graphql.tools.GraphQLResolver
import org.springframework.cache.annotation.CacheConfig
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Component
import se.filmstund.NotFoundException
import se.filmstund.database.dao.AttendeeDao
import se.filmstund.domain.dto.AdminPaymentDetailsDTO
import se.filmstund.domain.dto.AttendeePaymentDetailsDTO
import se.filmstund.domain.dto.FilmstadenSeatMapDTO
import se.filmstund.domain.dto.PublicUserDTO
import se.filmstund.domain.dto.TicketRange
import se.filmstund.domain.dto.core.AttendeeDTO
import se.filmstund.domain.dto.core.MovieDTO
import se.filmstund.domain.dto.core.ShowingDTO
import se.filmstund.domain.dto.core.TicketDTO
import se.filmstund.domain.id.Base64ID
import se.filmstund.domain.id.MovieID
import se.filmstund.domain.id.ShowingID
import se.filmstund.orElseThrow
import se.filmstund.services.MovieService
import se.filmstund.services.ShowingService
import se.filmstund.services.TicketService
import se.filmstund.services.UserService
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
@CacheConfig(cacheNames = ["graphql"], cacheManager = "graphQlCacheManager")
class ShowingResolver(
  private val showingService: ShowingService,
  private val attendeeDao: AttendeeDao,
  private val userService: UserService,
  private val movieService: MovieService,
  private val ticketService: TicketService
) : GraphQLResolver<ShowingDTO> {
  @Cacheable
  fun admin(showing: ShowingDTO): PublicUserDTO = userService
    .getUser(showing.admin)
    .orElseThrow { NotFoundException("admin user", showing.admin, showing.id) }

  @Cacheable
  fun payToUser(showing: ShowingDTO): PublicUserDTO = userService
    .getUser(showing.payToUser)
    .orElseThrow { NotFoundException("payment receiver user", showing.payToUser, showing.id) }

  @Cacheable
  fun movie(showing: ShowingDTO): MovieDTO = movieService.getMovieOrThrow(showing.movieId)

  fun attendees(showing: ShowingDTO): List<AttendeeDTO> =
    attendeeDao.findAllAttendees(showing.id)

  @Cacheable
  fun myTickets(showing: ShowingDTO): List<TicketDTO> = ticketService.getTicketsForCurrentUserAndShowing(showing.id)

  @Cacheable
  fun ticketRange(showing: ShowingDTO): TicketRange? = ticketService.getTicketRange(showing.id)

  fun adminPaymentDetails(showing: ShowingDTO): AdminPaymentDetailsDTO? =
    showingService.getAdminPaymentDetails(showing.id)

  fun attendeePaymentDetails(showing: ShowingDTO): AttendeePaymentDetailsDTO? =
    showingService.getAttendeePaymentDetails(showing.id)

  fun filmstadenSeatMap(showing: ShowingDTO): List<FilmstadenSeatMapDTO> = showingService.fetchSeatMap(showing.id)
}

@Component
class AttendeeUserResolver(private val userService: UserService, private val showingService: ShowingService) :
  GraphQLResolver<AttendeeDTO> {
  fun user(attendee: AttendeeDTO): PublicUserDTO = userService
    .getUserOrThrow(attendee.userId)

  // TODO: why is this needed?
  fun id(attendee: AttendeeDTO) = attendee.userId

  // TODO: why is this needed?
  fun showing(attendee: AttendeeDTO) = showingService.getShowingOrThrow(attendee.showingId)
}

@Component
class TicketUserResolver(private val userService: UserService) : GraphQLResolver<TicketDTO> {
  fun assignedToUser(ticket: TicketDTO): PublicUserDTO = userService.getUserOrThrow(ticket.assignedToUser)
}

