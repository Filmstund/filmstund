package rocks.didit.sefilm.services

import org.springframework.stereotype.Component
import rocks.didit.sefilm.NotFoundException
import rocks.didit.sefilm.TicketAlreadyInUserException
import rocks.didit.sefilm.TicketInUseException
import rocks.didit.sefilm.currentLoggedInUser
import rocks.didit.sefilm.database.repositories.ShowingRepository
import rocks.didit.sefilm.database.repositories.UserRepository
import rocks.didit.sefilm.domain.*
import rocks.didit.sefilm.domain.dto.ForetagsbiljettDTO
import java.time.LocalDate

@Component
class ForetagsbiljettService(
  private val showingRepository: ShowingRepository,
  private val userRepository: UserRepository
) {

  fun getStatusOfTicket(ticket: Foretagsbiljett): Foretagsbiljett.Status {
    if (ticket.expires < LocalDate.now()) {
      return Foretagsbiljett.Status.Expired
    }

    val showings = showingRepository.findAll()
      .filter { s -> s.participants.any { p -> hasTicket(p, ticket) } }

    if (showings.size > 1) {
      throw AssertionError("More than one showing with Företagsbiljett: ${ticket.number}")
    }

    if (showings.isEmpty()) {
      return Foretagsbiljett.Status.Available
    }

    return if (showings.first().ticketsBought) {
      Foretagsbiljett.Status.Used
    } else {
      Foretagsbiljett.Status.Pending
    }
  }

  fun getForetagsbiljetterForUser(userID: UserID): List<Foretagsbiljett> = userRepository
    .findById(userID)
    .map { it.foretagsbiljetter }
    .orElseGet { listOf() }

  fun addForetagsbiljetterToCurrentUser(biljetter: List<ForetagsbiljettDTO>) {
    val currentUser = userRepository.findById(currentLoggedInUser())
      .orElseThrow { NotFoundException("current user", currentLoggedInUser()) }
    val biljetterWithouthNew = currentUser
      .foretagsbiljetter
      .filterNot { (ticket) -> biljetter.any { ticket.number == it.number } }


    assertForetagsbiljetterNotAlreadyInUse(biljetter, currentUser.foretagsbiljetter)

    val newTickets = biljetter.map { Foretagsbiljett.valueOf(it) }
    val combinedTickets = newTickets
      .plus(biljetterWithouthNew)
      .sortedBy { it.expires }

    userRepository.save(currentUser.copy(foretagsbiljetter = combinedTickets))
  }

  fun deleteTicketFromUser(biljett: ForetagsbiljettDTO) {
    val currentUser = userRepository.findById(currentLoggedInUser())
      .orElseThrow { NotFoundException("current user", currentLoggedInUser()) }

    val ticketNumber = TicketNumber(biljett.number)
    val ticket = currentUser.foretagsbiljetter.find { it.number == ticketNumber }
      ?: throw NotFoundException("företagsbiljett with number $ticketNumber")
    assertTicketIsntPending(ticket)

    val ticketsWithoutDeleted = currentUser.foretagsbiljetter.filterNot { it.number == ticketNumber }
    userRepository.save(currentUser.copy(foretagsbiljetter = ticketsWithoutDeleted))
  }

  /** The tickets are allowed to be in use by the current user. */
  private fun assertForetagsbiljetterNotAlreadyInUse(
    biljetter: List<ForetagsbiljettDTO>,
    userBiljetter: List<Foretagsbiljett>
  ) {
    biljetter.forEach {
      val ticketNumber = TicketNumber(it.number)
      if (!userBiljetter.any { it.number == ticketNumber }
        && userRepository.existsByForetagsbiljetterNumber(TicketNumber(it.number))) {
        throw TicketAlreadyInUserException(currentLoggedInUser())
      }
    }
  }

  private fun assertTicketIsntPending(ticket: Foretagsbiljett) {
    if (getStatusOfTicket(ticket) == Foretagsbiljett.Status.Pending) {
      throw TicketInUseException(ticket.number)
    }
  }

  private fun hasTicket(p: Participant, ticket: Foretagsbiljett): Boolean {
    return when (p) {
      is FtgBiljettParticipant -> p.ticketNumber == ticket.number
      else -> false
    }
  }
}