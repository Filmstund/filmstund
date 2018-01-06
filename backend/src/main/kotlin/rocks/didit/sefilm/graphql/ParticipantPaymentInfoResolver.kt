@file:Suppress("unused")

package rocks.didit.sefilm.graphql

import com.coxautodev.graphql.tools.GraphQLResolver
import org.springframework.stereotype.Component
import rocks.didit.sefilm.database.entities.ParticipantPaymentInfo
import rocks.didit.sefilm.database.entities.Showing
import rocks.didit.sefilm.domain.dto.LimitedUserDTO
import rocks.didit.sefilm.domain.dto.PaymentDTO
import rocks.didit.sefilm.services.ShowingService
import rocks.didit.sefilm.services.UserService

@Component
class ParticipantPaymentInfoResolver(
  private val userService: UserService,
  private val showingService: ShowingService
) : GraphQLResolver<ParticipantPaymentInfo> {

  fun user(participantPaymentInfo: ParticipantPaymentInfo): LimitedUserDTO
    = userService.getUserOrThrow(participantPaymentInfo.userId)

  fun showing(participantPaymentInfo: ParticipantPaymentInfo): Showing
    = showingService.getShowingOrThrow(participantPaymentInfo.showingId)
}

@Component
class PaymentInfoResolver(
  private val userService: UserService
) : GraphQLResolver<PaymentDTO> {

  fun payTo(paymentDTO: PaymentDTO): LimitedUserDTO
    = userService.getUserOrThrow(paymentDTO.payTo)

  fun payer(paymentDTO: PaymentDTO): LimitedUserDTO
    = userService.getUserOrThrow(paymentDTO.payerUserID)
}
