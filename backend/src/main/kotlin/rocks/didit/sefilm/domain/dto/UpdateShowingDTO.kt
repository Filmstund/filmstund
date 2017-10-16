package rocks.didit.sefilm.domain.dto

import java.time.LocalDate
import java.time.LocalTime

data class UpdateShowingDTO(val price: Long = 0,
                            val private: Boolean = false,
                            val ticketsBought: Boolean = false,
                            val payToUser: String? = null,
                            val expectedBuyDate: LocalDate? = null,
                            val location: String? = null,
                            val time: LocalTime? = null,
                            /** Links to SF tickets, i.e https://www.sf.se/bokning/mina-e-biljetter/Sys99-SE/AA-1033-201712132045/RE-XXXXXXXXXX */
                            val cinemaTicketUrls: List<String> = listOf())