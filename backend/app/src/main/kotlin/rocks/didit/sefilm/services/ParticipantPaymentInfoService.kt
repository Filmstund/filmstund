package rocks.didit.sefilm.services

import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import rocks.didit.sefilm.NotFoundException
import rocks.didit.sefilm.database.repositories.ShowingRepository
import rocks.didit.sefilm.domain.dto.core.ParticipantDTO
import rocks.didit.sefilm.domain.dto.ParticipantPaymentInfoDTO

@Service
class ParticipantPaymentInfoService(
  private val showingRepo: ShowingRepository,
  private val assertionService: AssertionService
) {

  fun updatePaymentInfo(participantInfo: ParticipantPaymentInfoDTO): ParticipantDTO {
    require(!(participantInfo.showingId == null || participantInfo.userId == null)) { "Missing showing id and/or user id" }
    val showing = showingRepo.findByIdOrNull(participantInfo.showingId!!) ?: throw NotFoundException(
      "showing",
      showingId = participantInfo.showingId
    )
    assertionService.assertLoggedInUserIsAdmin(showing.admin.id)

    val participant = showing.participants
      .find { it.user.id == participantInfo.userId }
      ?: throw NotFoundException("participant", participantInfo.userId)
    participant.hasPaid = participantInfo.hasPaid
    return participant.toDTO()
  }
}