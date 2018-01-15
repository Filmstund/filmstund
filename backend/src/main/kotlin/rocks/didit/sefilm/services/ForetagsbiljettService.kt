package rocks.didit.sefilm.services

import org.springframework.stereotype.Service
import rocks.didit.sefilm.NotFoundException
import rocks.didit.sefilm.TicketAlreadyInUserException
import rocks.didit.sefilm.currentLoggedInUser
import rocks.didit.sefilm.database.repositories.ShowingRepository
import rocks.didit.sefilm.database.repositories.UserRepository
import rocks.didit.sefilm.domain.*
import rocks.didit.sefilm.domain.dto.ForetagsbiljettDTO
import java.time.LocalDate

@Service
class ForetagsbiljettService(
  private val showingRepository: ShowingRepository,
  private val userRepository: UserRepository) {

  fun getStatusOfTicket(ticket: Företagsbiljett): Företagsbiljett.Status {
    if (ticket.expires < LocalDate.now()) {
      return Företagsbiljett.Status.Expired
    }

    val showings = showingRepository.findAll()
      .filter { s -> s.participants.any { p -> hasTicket(p, ticket) } }

    if (showings.size > 1) {
      throw AssertionError("More than one showing with Företagsbiljett: ${ticket.number}")
    }

    if (showings.isEmpty()) {
      return Företagsbiljett.Status.Available
    }

    return if (showings.first().ticketsBought) {
      Företagsbiljett.Status.Used
    } else {
      Företagsbiljett.Status.Pending
    }
  }

  fun getForetagsbiljetterForUser(userID: UserID): List<Företagsbiljett>
    = userRepository
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

    val newTickets = biljetter.map { Företagsbiljett.valueOf(it) }
    val combinedTickets = newTickets
      .plus(biljetterWithouthNew)
      .sortedBy { it.expires }

    userRepository.save(currentUser.copy(foretagsbiljetter = combinedTickets))
  }

  fun deleteTicketFromUser(biljett: ForetagsbiljettDTO) {
    val currentUser = userRepository.findById(currentLoggedInUser())
      .orElseThrow { NotFoundException("current user", currentLoggedInUser()) }

    val ticketNumber = TicketNumber(biljett.number)
    val ticketsWithoutDeleted = currentUser.foretagsbiljetter.filterNot { it.number == ticketNumber }
    userRepository.save(currentUser.copy(foretagsbiljetter = ticketsWithoutDeleted))
  }

  /** The tickets are allowed to be in use by the current user. */
  private fun assertForetagsbiljetterNotAlreadyInUse(biljetter: List<ForetagsbiljettDTO>, userBiljetter: List<Företagsbiljett>) {
    biljetter.forEach {
      val ticketNumber = TicketNumber(it.number)
      if (!userBiljetter.any { it.number == ticketNumber }
        && userRepository.existsByForetagsbiljetterNumber(TicketNumber(it.number))) {
        throw TicketAlreadyInUserException(currentLoggedInUser())
      }
    }
  }

  private fun hasTicket(p: Participant, ticket: Företagsbiljett): Boolean {
    return when (p) {
      is FtgBiljettParticipant -> p.ticketNumber == ticket.number
      else -> false
    }
  }
}