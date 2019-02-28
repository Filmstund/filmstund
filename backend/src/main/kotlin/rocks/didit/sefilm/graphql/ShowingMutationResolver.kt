@file:Suppress("unused")

package rocks.didit.sefilm.graphql

import com.coxautodev.graphql.tools.GraphQLMutationResolver
import org.springframework.stereotype.Component
import rocks.didit.sefilm.domain.PaymentOption
import rocks.didit.sefilm.domain.UserID
import rocks.didit.sefilm.domain.dto.CreateShowingDTO
import rocks.didit.sefilm.domain.dto.ShowingDTO
import rocks.didit.sefilm.domain.dto.UpdateShowingDTO
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
  fun attendShowing(showingId: UUID, paymentOption: PaymentOption): ShowingDTO =
    showingService.attendShowing(showingId, paymentOption)

  fun unattendShowing(showingId: UUID): ShowingDTO = showingService.unattendShowing(showingId)

  fun createShowing(showing: CreateShowingDTO): ShowingDTO = showingService.createShowing(showing)

  fun deleteShowing(showingId: UUID): List<ShowingDTO> = showingService.deleteShowing(showingId)

  fun markAsBought(showingId: UUID): ShowingDTO = showingService.markAsBought(showingId)

  fun processTicketUrls(showingId: UUID, ticketUrls: List<String>): ShowingDTO {
    ticketService.processTickets(ticketUrls, showingId)
    return showingService.getShowingOrThrow(showingId)
  }

  fun updateShowing(showingId: UUID, newValues: UpdateShowingDTO): ShowingDTO =
    showingService.updateShowing(showingId, newValues)

  fun promoteToAdmin(showingId: UUID, userToPromote: UserID): ShowingDTO =
    adminService.promoteToAdmin(showingId, userToPromote)
}