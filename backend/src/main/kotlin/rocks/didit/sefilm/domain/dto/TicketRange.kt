package rocks.didit.sefilm.domain.dto

data class FirstLast(val first: Int, val last: Int, var count: Int)

data class TicketRange(val rows: List<Int>, val seatings: Map<Int, FirstLast>, val totalCount: Int)
