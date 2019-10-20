@file:Suppress("unused")

package se.filmstund.graphql

import com.coxautodev.graphql.tools.GraphQLResolver
import org.springframework.stereotype.Component
import se.filmstund.domain.dto.AttendeePaymentDetailsDTO
import se.filmstund.domain.dto.PublicUserDTO
import se.filmstund.services.UserService

@Component
class PaymentInfoResolver(
  private val userService: UserService
) : GraphQLResolver<AttendeePaymentDetailsDTO> {

  fun payTo(paymentDTO: AttendeePaymentDetailsDTO): PublicUserDTO = userService.getUserOrThrow(paymentDTO.payTo)

  fun payer(paymentDTO: AttendeePaymentDetailsDTO): PublicUserDTO = userService.getUserOrThrow(paymentDTO.payerUserID)
}
