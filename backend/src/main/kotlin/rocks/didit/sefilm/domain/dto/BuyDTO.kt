package rocks.didit.sefilm.domain.dto

import rocks.didit.sefilm.database.entities.ParticipantPaymentInfo
import rocks.didit.sefilm.domain.Bioklubbnummer
import rocks.didit.sefilm.domain.TicketNumber
import rocks.didit.sefilm.domain.UserID

data class BuyDTO(val sfBuyLink: String? = null,
                  val tickets: List<UserToTicketMap>,
                  val participantInfo: Collection<ParticipantPaymentInfo> = emptyList())

data class UserToTicketMap(val userId: UserID, val bioklubbnummer: Bioklubbnummer?, val foretagsbiljett: TicketNumber?)