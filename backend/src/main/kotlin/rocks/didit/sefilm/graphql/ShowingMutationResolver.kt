package rocks.didit.sefilm.graphql

import com.coxautodev.graphql.tools.GraphQLMutationResolver
import org.springframework.stereotype.Component
import rocks.didit.sefilm.database.entities.Showing
import rocks.didit.sefilm.domain.PaymentOption
import rocks.didit.sefilm.domain.dto.ShowingDTO
import rocks.didit.sefilm.services.ShowingService
import java.util.*

@Component
class ShowingMutationResolver(
  private val showingService: ShowingService
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
}