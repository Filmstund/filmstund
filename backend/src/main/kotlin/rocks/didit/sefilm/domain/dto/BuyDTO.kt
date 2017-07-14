package rocks.didit.sefilm.domain.dto

import rocks.didit.sefilm.database.entities.ParticipantInfo
import rocks.didit.sefilm.domain.Bioklubbnummer
import rocks.didit.sefilm.domain.Participant

data class BuyDTO(val bioklubbnummer: Collection<Bioklubbnummer>,
                  val sfBuyLink: String?,
                  val participantInfo: Collection<ParticipantInfo>,
                  val participants: Collection<Participant>) {
}