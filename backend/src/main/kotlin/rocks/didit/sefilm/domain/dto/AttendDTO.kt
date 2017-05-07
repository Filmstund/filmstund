package rocks.didit.sefilm.domain.dto

import rocks.didit.sefilm.domain.UserID
import java.util.*

data class AttendDTO(val attending: Boolean, val showingId: UUID, val userID: UserID)