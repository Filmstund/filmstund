package rocks.didit.sefilm.services

import org.springframework.security.access.AccessDeniedException
import org.springframework.stereotype.Service
import rocks.didit.sefilm.currentLoggedInUser
import rocks.didit.sefilm.database.dao.AttendeeDao
import rocks.didit.sefilm.domain.SEK
import rocks.didit.sefilm.domain.dto.AttendeePaymentInfoDTO
import rocks.didit.sefilm.domain.dto.core.AttendeeDTO

@Service
class AttendeePaymentService(private val attendeeDao: AttendeeDao) {

  fun updatePaymentInfo(attendeeInfo: AttendeePaymentInfoDTO): AttendeeDTO {
    require(attendeeInfo.showingId != null && attendeeInfo.userId != null) { "Missing showing id and/or user id" }

    return attendeeDao.updatePaymentStatus(
      attendeeInfo.userId!!,
      attendeeInfo.showingId!!,
      currentLoggedInUser().id,
      attendeeInfo.hasPaid,
      if (attendeeInfo.hasPaid) SEK.ZERO else null
    ) ?: throw AccessDeniedException("Only the showing admin is allowed to do that")
  }
}