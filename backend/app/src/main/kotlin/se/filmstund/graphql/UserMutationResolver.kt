@file:Suppress("unused")

package se.filmstund.graphql

import com.coxautodev.graphql.tools.GraphQLMutationResolver
import org.springframework.stereotype.Component
import se.filmstund.domain.dto.AttendeePaymentInfoDTO
import se.filmstund.domain.dto.GiftCertificateDTO
import se.filmstund.domain.dto.UserDetailsDTO
import se.filmstund.domain.dto.core.AttendeeDTO
import se.filmstund.domain.dto.core.UserDTO
import se.filmstund.services.AttendeePaymentService
import se.filmstund.services.GiftCertificateService
import se.filmstund.services.UserService

@Component
class UserMutationResolver(
  private val userService: UserService,
  private val attendeePaymentInfoService: AttendeePaymentService,
  private val giftCertificateService: GiftCertificateService
) : GraphQLMutationResolver {

  fun updateUser(newInfo: UserDetailsDTO): UserDTO = userService.updateUser(newInfo)

  fun updateAttendeePaymentInfo(paymentInfo: AttendeePaymentInfoDTO): AttendeeDTO =
    attendeePaymentInfoService.updatePaymentInfo(paymentInfo)

  fun addGiftCertificates(giftCerts: List<GiftCertificateDTO>): UserDTO {
    giftCertificateService.addGiftCertsToCurrentUser(giftCerts)
    return userService.getCurrentUser()
  }

  fun deleteGiftCertificate(giftCert: GiftCertificateDTO): UserDTO {
    giftCertificateService.deleteTicketFromUser(giftCert)
    return userService.getCurrentUser()
  }

  fun invalidateCalendarFeed() = userService.invalidateCalendarFeedId()
  fun disableCalendarFeed() = userService.disableCalendarFeed()
}