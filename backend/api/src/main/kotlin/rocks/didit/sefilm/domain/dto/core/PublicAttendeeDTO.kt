package rocks.didit.sefilm.domain.dto.core

import rocks.didit.sefilm.domain.dto.PublicUserDTO
import rocks.didit.sefilm.domain.id.ShowingID
import rocks.didit.sefilm.domain.id.UserID

data class PublicAttendeeDTO(
  val userId: UserID,
  val showingId: ShowingID,
  val userInfo: PublicUserDTO
)