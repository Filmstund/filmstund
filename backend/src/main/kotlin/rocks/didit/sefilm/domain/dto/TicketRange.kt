package rocks.didit.sefilm.domain.dto

data class TicketRange(val rows: List<Int>, val seatings: Map<Int, List<Int>>, val totalCount: Int)
