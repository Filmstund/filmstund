package rocks.didit.sefilm.domain.dto

import rocks.didit.sefilm.domain.Bioklubbnummer


data class BuyDTO(val bioklubbnummer: Collection<Bioklubbnummer>,
                  val sfBuyLink: String?) {
}