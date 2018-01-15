@file:Suppress("unused")

package rocks.didit.sefilm.graphql

import com.coxautodev.graphql.tools.GraphQLMutationResolver
import org.springframework.stereotype.Component
import rocks.didit.sefilm.database.entities.ParticipantPaymentInfo
import rocks.didit.sefilm.domain.dto.*
import rocks.didit.sefilm.services.ForetagsbiljettService
import rocks.didit.sefilm.services.ParticipantPaymentInfoService
import rocks.didit.sefilm.services.UserService

@Component
class UserMutationResolver(
  private val userService: UserService,
  private val participantPaymentInfoService: ParticipantPaymentInfoService,
  private val foretagsbiljettService: ForetagsbiljettService
) : GraphQLMutationResolver {

  fun updateUser(newInfo: UserDetailsDTO): UserDTO
    = userService.updateUser(newInfo)

  fun updateParticipantPaymentInfo(paymentInfo: ParticipantPaymentInfoDTO): ParticipantPaymentInfo
    = participantPaymentInfoService.updatePaymentInfo(paymentInfo)

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

  fun updateNotificationSettings(notificationInput: NotificationInputDTO)
    = userService.updateNotificationSettings(notificationInput)
}