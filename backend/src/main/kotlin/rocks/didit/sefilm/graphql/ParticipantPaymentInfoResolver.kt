@file:Suppress("unused")

package rocks.didit.sefilm.graphql

import com.coxautodev.graphql.tools.GraphQLResolver
import org.springframework.stereotype.Component
import rocks.didit.sefilm.database.mongo.entities.ParticipantPaymentInfo
import rocks.didit.sefilm.domain.dto.AttendeePaymentDetailsDTO
import rocks.didit.sefilm.domain.dto.LimitedUserDTO
import rocks.didit.sefilm.domain.dto.ShowingDTO
import rocks.didit.sefilm.services.ShowingService
import rocks.didit.sefilm.services.UserService

@Component
class ParticipantPaymentInfoResolver(
  private val userService: UserService,
  private val showingService: ShowingService
) : GraphQLResolver<ParticipantPaymentInfo> {

  fun user(participantPaymentInfo: ParticipantPaymentInfo): LimitedUserDTO =
    userService.getUserOrThrow(participantPaymentInfo.userId)

  fun showing(participantPaymentInfo: ParticipantPaymentInfo): ShowingDTO =
    showingService.getShowingOrThrow(participantPaymentInfo.showingId)
}

@Component
class PaymentInfoResolver(
  private val userService: UserService
) : GraphQLResolver<AttendeePaymentDetailsDTO> {

  fun payTo(paymentDTO: AttendeePaymentDetailsDTO): LimitedUserDTO = userService.getUserOrThrow(paymentDTO.payTo)

  fun payer(paymentDTO: AttendeePaymentDetailsDTO): LimitedUserDTO = userService.getUserOrThrow(paymentDTO.payerUserID)
}
