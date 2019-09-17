@file:Suppress("unused")

package rocks.didit.sefilm.graphql

import com.coxautodev.graphql.tools.GraphQLMutationResolver
import org.springframework.stereotype.Component
import rocks.didit.sefilm.domain.dto.ForetagsbiljettDTO
import rocks.didit.sefilm.domain.dto.NotificationSettingsInputDTO
import rocks.didit.sefilm.domain.dto.ParticipantDTO
import rocks.didit.sefilm.domain.dto.ParticipantPaymentInfoDTO
import rocks.didit.sefilm.domain.dto.UserDTO
import rocks.didit.sefilm.domain.dto.UserDetailsDTO
import rocks.didit.sefilm.services.GiftCertificateService
import rocks.didit.sefilm.services.ParticipantPaymentInfoService
import rocks.didit.sefilm.services.UserService

@Component
class UserMutationResolver(
  private val userService: UserService,
  private val participantPaymentInfoService: ParticipantPaymentInfoService,
  private val foretagsbiljettService: GiftCertificateService
) : GraphQLMutationResolver {

  fun updateUser(newInfo: UserDetailsDTO): UserDTO = userService.updateUser(newInfo)

  fun updateParticipantPaymentInfo(paymentInfo: ParticipantPaymentInfoDTO): ParticipantDTO =
    participantPaymentInfoService.updatePaymentInfo(paymentInfo)

  fun addForetagsBiljetter(biljetter: List<ForetagsbiljettDTO>): UserDTO {
    foretagsbiljettService.addForetagsbiljetterToCurrentUser(biljetter)
    return userService.getCurrentUser()
  }

  fun deleteForetagsBiljett(biljett: ForetagsbiljettDTO): UserDTO {
    foretagsbiljettService.deleteTicketFromUser(biljett)
    return userService.getCurrentUser()
  }

  fun invalidateCalendarFeed() = userService.invalidateCalendarFeedId()
  fun disableCalendarFeed() = userService.disableCalendarFeed()

  fun updateNotificationSettings(notificationInput: NotificationSettingsInputDTO) =
    userService.updateNotificationSettings(notificationInput)
}