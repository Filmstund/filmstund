package se.filmstund.services

import org.springframework.security.access.AccessDeniedException
import org.springframework.stereotype.Service
import se.filmstund.currentLoggedInUser
import se.filmstund.database.dao.AttendeeDao
import se.filmstund.domain.SEK
import se.filmstund.domain.dto.AttendeePaymentInfoDTO
import se.filmstund.domain.dto.core.AttendeeDTO

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