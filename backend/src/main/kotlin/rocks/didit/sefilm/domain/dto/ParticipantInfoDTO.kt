package rocks.didit.sefilm.domain.dto

import java.util.*

data class ParticipantInfoDTO(
        val id: UUID = UUID.randomUUID(),
        val userId: String? = null,
        val showingId: UUID? = null,
        val hasPayed: Boolean = false,
        val amountOwed: Long = 0)

