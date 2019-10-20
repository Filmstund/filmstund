package se.filmstund.domain.dto

data class TicketRange(val rows: List<Int>, val seatings: List<SeatRange>, val totalCount: Int)

data class SeatRange(val row: Int, val numbers: List<Int>)
