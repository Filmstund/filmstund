@file:Suppress("unused")

package se.filmstund.graphql

import com.coxautodev.graphql.tools.GraphQLMutationResolver
import org.springframework.stereotype.Component
import se.filmstund.domain.PaymentOption
import se.filmstund.domain.SEK
import se.filmstund.domain.dto.CreateShowingDTO
import se.filmstund.domain.dto.UpdateShowingDTO
import se.filmstund.domain.dto.core.ShowingDTO
import se.filmstund.domain.id.ShowingID
import se.filmstund.domain.id.UserID
import se.filmstund.services.AdminService
import se.filmstund.services.ShowingService
import se.filmstund.services.TicketService
import java.util.*

@Component
class ShowingMutationResolver(
  private val showingService: ShowingService,
  private val adminService: AdminService,
  private val ticketService: TicketService
) : GraphQLMutationResolver {
  fun attendShowing(showingId: ShowingID, paymentOption: PaymentOption): ShowingDTO =
    showingService.attendShowing(showingId, paymentOption)

  fun unattendShowing(showingId: ShowingID): ShowingDTO = showingService.unattendShowing(showingId)

  fun createShowing(showing: CreateShowingDTO): ShowingDTO = showingService.createShowing(showing)

  fun deleteShowing(showingId: ShowingID): List<ShowingDTO> = showingService.deleteShowing(showingId)

  fun markAsBought(showingId: ShowingID, price: SEK): ShowingDTO = showingService.markAsBought(showingId, price)

  fun processTicketUrls(showingId: ShowingID, ticketUrls: List<String>): ShowingDTO {
    ticketService.processTickets(ticketUrls, showingId)
    return showingService.getShowingOrThrow(showingId)
  }

  fun updateShowing(showingId: ShowingID, newValues: UpdateShowingDTO): ShowingDTO =
    showingService.updateShowing(showingId, newValues)

  fun promoteToAdmin(showingId: ShowingID, userToPromote: UserID): ShowingDTO =
    adminService.promoteToAdmin(showingId, userToPromote)
}