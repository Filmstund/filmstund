@file:Suppress("unused")

package rocks.didit.sefilm.graphql

import com.coxautodev.graphql.tools.GraphQLResolver
import org.springframework.stereotype.Component
import rocks.didit.sefilm.domain.dto.AttendeePaymentDetailsDTO
import rocks.didit.sefilm.domain.dto.PublicUserDTO
import rocks.didit.sefilm.services.UserService

@Component
class PaymentInfoResolver(
  private val userService: UserService
) : GraphQLResolver<AttendeePaymentDetailsDTO> {

  fun payTo(paymentDTO: AttendeePaymentDetailsDTO): PublicUserDTO = userService.getUserOrThrow(paymentDTO.payTo)

  fun payer(paymentDTO: AttendeePaymentDetailsDTO): PublicUserDTO = userService.getUserOrThrow(paymentDTO.payerUserID)
}
