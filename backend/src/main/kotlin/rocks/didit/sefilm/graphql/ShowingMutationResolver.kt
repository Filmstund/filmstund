@file:Suppress("unused")

package rocks.didit.sefilm.graphql

import com.coxautodev.graphql.tools.GraphQLMutationResolver
import org.springframework.stereotype.Component
import rocks.didit.sefilm.database.entities.Showing
import rocks.didit.sefilm.domain.PaymentOption
import rocks.didit.sefilm.domain.dto.ShowingDTO
import rocks.didit.sefilm.domain.dto.UpdateShowingDTO
import rocks.didit.sefilm.services.ShowingService
import rocks.didit.sefilm.services.TicketService
import java.util.*

@Component
class ShowingMutationResolver(
  private val showingService: ShowingService,
  private val ticketService: TicketService
) : GraphQLMutationResolver {
  fun attendShowing(showingId: UUID, paymentOption: PaymentOption): Showing
    = showingService.attendShowing(showingId, paymentOption)

  fun unattendShowing(showingId: UUID): Showing
    = showingService.unattendShowing(showingId)

  fun createShowing(showing: ShowingDTO): Showing
    = showingService.createShowing(showing)

  fun deleteShowing(showingId: UUID): List<Showing>
    = showingService.deleteShowing(showingId)

  fun createCalendarEvent(showingId: UUID): Showing
    = showingService.createCalendarEvent(showingId)

  fun deleteCalendarEvent(showingId: UUID): Showing
    = showingService.deleteCalendarEvent(showingId)

  fun markAsBought(showingId: UUID): Showing
    = showingService.markAsBought(showingId)

  fun processTicketUrls(showingId: UUID, ticketUrls: List<String>): Showing {
    ticketService.processTickets(ticketUrls, showingId)
    return showingService.getShowingOrThrow(showingId)
  }

  fun updateShowing(showingId: UUID, newValues: UpdateShowingDTO): Showing
    = showingService.updateShowing(showingId, newValues)
}