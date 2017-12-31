package rocks.didit.sefilm.web.controllers

import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.*
import rocks.didit.sefilm.Application
import rocks.didit.sefilm.web.services.TicketService
import java.util.*

@RestController
@RequestMapping(Application.API_BASE_PATH + "/tickets")
class TicketController(private val ticketService: TicketService) {

  @GetMapping("/{showingId}", produces = [(MediaType.APPLICATION_JSON_UTF8_VALUE)])
  fun myTickets(@PathVariable showingId: UUID) = ticketService.getTicketsForCurrentUserAndShowing(showingId)

  @GetMapping("/{showingId}/seating-range", produces = [(MediaType.APPLICATION_JSON_UTF8_VALUE)])
  fun seatingRange(@PathVariable showingId: UUID) = ticketService.getTicketRange(showingId)

  @PostMapping("/{showingId}", consumes = [(MediaType.APPLICATION_JSON_UTF8_VALUE)], produces = [(MediaType.APPLICATION_JSON_UTF8_VALUE)])
  fun processTickets(@PathVariable showingId: UUID, @RequestBody urls: List<String>) = ticketService.processTickets(urls, showingId)
}