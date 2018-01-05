package rocks.didit.sefilm.graphql

import com.coxautodev.graphql.tools.GraphQLMutationResolver
import org.springframework.stereotype.Component
import rocks.didit.sefilm.database.entities.ParticipantPaymentInfo
import rocks.didit.sefilm.domain.dto.ParticipantInfoDTO
import rocks.didit.sefilm.domain.dto.UserDTO
import rocks.didit.sefilm.domain.dto.UserDetailsDTO
import rocks.didit.sefilm.services.ParticipantPaymentInfoService
import rocks.didit.sefilm.services.UserService

@Component
class UserMutationResolver(
  private val userService: UserService,
  private val participantPaymentInfoService: ParticipantPaymentInfoService
) : GraphQLMutationResolver {

  fun updateUser(newInfo: UserDetailsDTO): UserDTO
    = userService.updateUser(newInfo)

  fun updateParticipantPaymentInfo(paymentInfo: ParticipantInfoDTO): ParticipantPaymentInfo
    = participantPaymentInfoService.updatePaymentInfo(paymentInfo)
}