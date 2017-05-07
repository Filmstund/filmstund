package rocks.didit.sefilm.domain

import java.util.*

data class AttendDTO(val attending: Boolean, val showingId: UUID, val userID: UserID)