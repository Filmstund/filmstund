package se.filmstund.domain.dto.core

import se.filmstund.domain.id.ShowingID
import se.filmstund.domain.id.UserID

data class PublicAttendeeDTO(
  val userId: UserID,
  val showingId: ShowingID,
  val userInfo: PublicUserDTO
) {
  companion object {
    fun from(attendee: AttendeeDTO): PublicAttendeeDTO =
      PublicAttendeeDTO(attendee.userId, attendee.showingId, attendee.userInfo)
  }
}