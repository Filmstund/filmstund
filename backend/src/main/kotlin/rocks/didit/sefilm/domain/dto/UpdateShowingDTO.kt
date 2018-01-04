package rocks.didit.sefilm.domain.dto

import java.time.LocalDate
import java.time.LocalTime

data class UpdateShowingDTO(val price: Long = 0,
                            val private: Boolean = false,
                            @Deprecated("Should be removed when we switch to graphql")
                            val ticketsBought: Boolean = false,
                            val payToUser: String = "N/A",
                            val expectedBuyDate: LocalDate? = null,
                            val location: String = "Filmstaden Bergakungen",
                            val time: LocalTime = LocalTime.NOON,
                            /** Links to SF tickets, i.e https://www.sf.se/bokning/mina-e-biljetter/Sys99-SE/AA-1033-201712132045/RE-XXXXXXXXXX */
                            @Deprecated("Should be removed when we switch to graphql")
                            val cinemaTicketUrls: List<String> = listOf())