package rocks.didit.sefilm.web.controllers

import org.springframework.http.MediaType
import org.springframework.security.access.AccessDeniedException
import org.springframework.web.bind.annotation.*
import rocks.didit.sefilm.Application
import rocks.didit.sefilm.NotFoundException
import rocks.didit.sefilm.UserHasNotPaidException
import rocks.didit.sefilm.currentLoggedInUser
import rocks.didit.sefilm.database.entities.Ticket
import rocks.didit.sefilm.database.repositories.ParticipantPaymentInfoRepository
import rocks.didit.sefilm.database.repositories.ShowingRepository
import rocks.didit.sefilm.database.repositories.TicketRepository
import rocks.didit.sefilm.domain.UserID
import rocks.didit.sefilm.domain.dto.FirstLast
import rocks.didit.sefilm.domain.dto.TicketRange
import rocks.didit.sefilm.web.services.TicketService
import java.time.LocalDate
import java.util.*

@RestController
@RequestMapping(Application.API_BASE_PATH + "/tickets")
class TicketController(private val ticketRepository: TicketRepository,
                       private val showingRepository: ShowingRepository,
                       private val ticketService: TicketService,
                       private val paymentInfoRepository: ParticipantPaymentInfoRepository) {

  @GetMapping("/", produces = [(MediaType.APPLICATION_JSON_UTF8_VALUE)])
  fun allMyTickets(): List<Ticket> {
    val currentLoggedInUser = currentLoggedInUser()
    val now = LocalDate.now()
    return ticketRepository.findByAssignedToUser(currentLoggedInUser)
      .filter {
        it.date.isEqual(now) || it.date.isAfter(now)
      }
  }

  @GetMapping("/{showingId}", produces = [(MediaType.APPLICATION_JSON_UTF8_VALUE)])
  fun myTickets(@PathVariable showingId: UUID): List<Ticket> {
    val currentLoggedInUser = currentLoggedInUser()
    assertPaidAndEnrolled(showingId, currentLoggedInUser)

    return ticketRepository.findByShowingIdAndAssignedToUser(showingId, currentLoggedInUser)
  }

  @GetMapping("/{showingId}/seating-range", produces = [(MediaType.APPLICATION_JSON_UTF8_VALUE)])
  fun seatingRange(@PathVariable showingId: UUID): TicketRange {
    val currentLoggedInUser = currentLoggedInUser()
    assertPaidAndEnrolled(showingId, currentLoggedInUser)

    val allSeatsForShowing = ticketRepository.findByShowingId(showingId)
      .map { it.seat }

    val rows = allSeatsForShowing
      .map { it.row }
      .distinct()
      .sorted()

    val groupedSeats = allSeatsForShowing.groupBy { it.row }
    val seatingRange = groupedSeats.mapValues {
      val first = it.value.minBy { it.number }?.number ?: 0
      val last = it.value.maxBy { it.number }?.number ?: 0
      FirstLast(first, last, it.value.size)
    }

    return TicketRange(rows, seatingRange, allSeatsForShowing.size)
  }

  @PostMapping("/{showingId}",
    consumes = [(MediaType.APPLICATION_JSON_UTF8_VALUE)],
    produces = [(MediaType.APPLICATION_JSON_UTF8_VALUE)])
  fun processTickets(@PathVariable showingId: UUID, @RequestBody urls: List<String>): List<Ticket> {
    val currentLoggedInUser = currentLoggedInUser()
    val showing = showingRepository.findById(showingId)
      .orElseThrow { NotFoundException("showing with id $showingId") }

    if (showing.admin != currentLoggedInUser) {
      throw AccessDeniedException("Only the showing admin is allowed to do that")
    }

    ticketService.processTickets(urls, showing)
    return myTickets(showingId)
  }

  private fun assertPaidAndEnrolled(showingId: UUID, currentLoggedInUser: UserID) {
    val participant = paymentInfoRepository
      .findByShowingIdAndUserId(showingId, currentLoggedInUser)
      .orElseThrow {
        throw NotFoundException("user. Not enrolled on this showing")
      }

    if (!participant.hasPaid) {
      throw UserHasNotPaidException("User has not paid for this showing")
    }
  }
}