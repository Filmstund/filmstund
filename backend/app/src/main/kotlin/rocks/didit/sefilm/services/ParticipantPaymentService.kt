package rocks.didit.sefilm.services

import org.springframework.security.access.AccessDeniedException
import org.springframework.stereotype.Service
import rocks.didit.sefilm.currentLoggedInUser
import rocks.didit.sefilm.database.dao.ParticipantDao
import rocks.didit.sefilm.domain.SEK
import rocks.didit.sefilm.domain.dto.ParticipantPaymentInfoDTO
import rocks.didit.sefilm.domain.dto.core.ParticipantDTO

@Service
class ParticipantPaymentService(private val participantDao: ParticipantDao) {

  fun updatePaymentInfo(participantInfo: ParticipantPaymentInfoDTO): ParticipantDTO {
    require(participantInfo.showingId != null && participantInfo.userId != null) { "Missing showing id and/or user id" }

    return participantDao.updatePaymentStatus(
      participantInfo.userId!!,
      participantInfo.showingId!!,
      currentLoggedInUser().id,
      participantInfo.hasPaid,
      if (participantInfo.hasPaid) SEK.ZERO else null
    ) ?: throw AccessDeniedException("Only the showing admin is allowed to do that")
  }
}