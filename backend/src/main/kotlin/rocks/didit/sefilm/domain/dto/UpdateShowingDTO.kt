package rocks.didit.sefilm.domain.dto

import java.time.LocalDate

data class UpdateShowingDTO(val price: Long = 0,
                            val private: Boolean = false,
                            val ticketsBought: Boolean = false,
                            val payToUser: String? = null,
                            val expectedBuyDate: LocalDate? = null)