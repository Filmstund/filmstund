package rocks.didit.sefilm.graphql

import com.coxautodev.graphql.tools.GraphQLMutationResolver
import org.springframework.stereotype.Component
import rocks.didit.sefilm.database.entities.ParticipantPaymentInfo
import rocks.didit.sefilm.domain.dto.ParticipantInfoDTO
import rocks.didit.sefilm.services.ParticipantPaymentInfoService

@Component
class ParticipantPaymentInfoMutationResolver(
  private val participantPaymentInfoService: ParticipantPaymentInfoService
) : GraphQLMutationResolver {

  fun updateParticipantPaymentInfo(paymentInfo: ParticipantInfoDTO): ParticipantPaymentInfo
    = participantPaymentInfoService.updatePaymentInfo(paymentInfo)
}