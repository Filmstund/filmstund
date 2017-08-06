package rocks.didit.sefilm.domain.dto

import rocks.didit.sefilm.database.entities.ParticipantPaymentInfo
import rocks.didit.sefilm.domain.Bioklubbnummer
import rocks.didit.sefilm.domain.UserID
import rocks.didit.sefilm.domain.Participant

data class BuyDTO(val sfBuyLink: String? = null,
                  val bioklubbnummer: List<BioklubbUserMap>,
                  val participantInfo: Collection<ParticipantPaymentInfo> = emptyList(),
                  val participants: Collection<Participant> = emptyList())

data class BioklubbUserMap(val user: UserID, val bioklubbnummer: Bioklubbnummer?)