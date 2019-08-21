package rocks.didit.sefilm.domain.dto

import java.util.*

data class ParticipantPaymentInfoDTO(
        val id: UUID = UUID.randomUUID(),
        val userId: String? = null,
        val showingId: UUID? = null,
        val hasPaid: Boolean = false,
        val amountOwed: Long = 0
)

