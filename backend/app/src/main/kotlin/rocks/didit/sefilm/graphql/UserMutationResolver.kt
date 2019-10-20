@file:Suppress("unused")

package rocks.didit.sefilm.graphql

import com.coxautodev.graphql.tools.GraphQLMutationResolver
import org.springframework.stereotype.Component
import rocks.didit.sefilm.domain.dto.AttendeePaymentInfoDTO
import rocks.didit.sefilm.domain.dto.GiftCertificateDTO
import rocks.didit.sefilm.domain.dto.NotificationSettingsInputDTO
import rocks.didit.sefilm.domain.dto.UserDetailsDTO
import rocks.didit.sefilm.domain.dto.core.AttendeeDTO
import rocks.didit.sefilm.domain.dto.core.UserDTO
import rocks.didit.sefilm.services.AttendeePaymentService
import rocks.didit.sefilm.services.GiftCertificateService
import rocks.didit.sefilm.services.UserService

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

  fun updateNotificationSettings(notificationInput: NotificationSettingsInputDTO) =
    userService.updateNotificationSettings(notificationInput)
}