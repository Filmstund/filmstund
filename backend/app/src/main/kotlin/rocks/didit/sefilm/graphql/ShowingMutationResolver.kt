@file:Suppress("unused")

package rocks.didit.sefilm.graphql

import com.coxautodev.graphql.tools.GraphQLMutationResolver
import org.springframework.stereotype.Component
import rocks.didit.sefilm.domain.PaymentOption
import rocks.didit.sefilm.domain.SEK
import rocks.didit.sefilm.domain.dto.CreateShowingDTO
import rocks.didit.sefilm.domain.dto.UpdateShowingDTO
import rocks.didit.sefilm.domain.dto.core.ShowingDTO
import rocks.didit.sefilm.domain.id.ShowingID
import rocks.didit.sefilm.domain.id.UserID
import rocks.didit.sefilm.services.AdminService
import rocks.didit.sefilm.services.ShowingService
import rocks.didit.sefilm.services.TicketService
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