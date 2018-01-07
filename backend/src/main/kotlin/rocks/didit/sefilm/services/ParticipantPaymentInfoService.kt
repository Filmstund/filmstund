package rocks.didit.sefilm.services

import org.springframework.security.access.AccessDeniedException
import org.springframework.stereotype.Component
import rocks.didit.sefilm.NotFoundException
import rocks.didit.sefilm.database.entities.ParticipantPaymentInfo
import rocks.didit.sefilm.database.repositories.ParticipantPaymentInfoRepository
import rocks.didit.sefilm.domain.SEK
import rocks.didit.sefilm.domain.dto.ParticipantPaymentInfoDTO

@Component
class ParticipantPaymentInfoService(
  private val participantInfoRepo: ParticipantPaymentInfoRepository,
  private val showingService: ShowingService,
  private val assertionService: AssertionService) {

  fun updatePaymentInfo(participantInfo: ParticipantPaymentInfoDTO): ParticipantPaymentInfo {
    if (participantInfo.showingId == null || participantInfo.userId == null) {
      throw IllegalArgumentException("Missing showing id and/or user id")
    }
    assertionService.assertLoggedInUserIsAdmin(showingService.getShowingOrThrow(participantInfo.showingId))

    val paymentInfo = participantInfoRepo
      .findById(participantInfo.id)
      .orElseThrow { NotFoundException("participant info '${participantInfo.id}'", showingId = participantInfo.showingId) }

    if (paymentInfo.showingId != participantInfo.showingId) {
      throw AccessDeniedException("Oh no you didn't!")
    }

    val newInfo = paymentInfo.copy(hasPaid = participantInfo.hasPaid, amountOwed = SEK(participantInfo.amountOwed))
    return participantInfoRepo.save(newInfo)
  }
}