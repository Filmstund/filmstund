package rocks.didit.sefilm.web.controllers

import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController
import rocks.didit.sefilm.Application
import rocks.didit.sefilm.NotFoundException
import rocks.didit.sefilm.UserHasNotPayedException
import rocks.didit.sefilm.currentLoggedInUser
import rocks.didit.sefilm.database.entities.Ticket
import rocks.didit.sefilm.database.repositories.ParticipantPaymentInfoRepository
import rocks.didit.sefilm.database.repositories.TicketRepository
import java.util.*

@RestController(Application.API_BASE_PATH + "/tickets")
class TicketController(private val ticketRepository: TicketRepository,
                       private val paymentInfoRepository: ParticipantPaymentInfoRepository) {

  @GetMapping("/{showingId}", produces = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE))
  fun myTicket(showingId: UUID): Ticket {
    val currentLoggedInUser = currentLoggedInUser()

    paymentInfoRepository
      .findByShowingIdAndUserId(showingId, currentLoggedInUser)
      .orElseThrow {
        throw UserHasNotPayedException("User has not payed for this showing yet")
      }

    return ticketRepository.findByShowingIdAndAssignedToUser(showingId, currentLoggedInUser)
      .orElseThrow { NotFoundException("Ticket not for this user and showing") }
  }
}