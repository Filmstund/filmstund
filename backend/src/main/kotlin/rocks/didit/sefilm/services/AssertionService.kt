package rocks.didit.sefilm.services

import org.springframework.security.access.AccessDeniedException
import org.springframework.stereotype.Service
import rocks.didit.sefilm.*
import rocks.didit.sefilm.database.entities.Showing
import rocks.didit.sefilm.domain.Företagsbiljett
import rocks.didit.sefilm.domain.TicketNumber
import rocks.didit.sefilm.domain.UserID
import rocks.didit.sefilm.domain.dto.ShowingDTO

@Service
class AssertionService(
  private val userService: UserService,
  private val foretagsbiljettService: ForetagsbiljettService) {

  fun assertTicketsNotBought(userID: UserID, showing: Showing) {
    if (showing.ticketsBought) {
      throw TicketsAlreadyBoughtException(userID, showing.id)
    }
  }

  fun assertUserNotAlreadyAttended(userID: UserID, showing: Showing) {
    if (showing.participants.any { it.userId == userID }) {
      throw UserAlreadyAttendedException(userID)
    }
  }

  fun assertLoggedInUserIsAdmin(showing: ShowingDTO) = assertLoggedInUserIsAdmin(showing.admin)
  fun assertLoggedInUserIsAdmin(showingAdmin: UserID) {
    if (currentLoggedInUser() != showingAdmin) {
      throw AccessDeniedException("Only the showing admin is allowed to do that")
    }
  }

  fun assertUserHasPhoneNumber(userID: UserID) {
    val user = userService.getUserOrThrow(userID)
    if (user.phone == null || user.phone.isBlank()) {
      throw MissingPhoneNumberException(userID)
    }
  }

  fun assertForetagsbiljettIsAvailable(userId: UserID, suppliedTicket: TicketNumber) {
    val matchingTickets = foretagsbiljettService
      .getForetagsbiljetterForUser(userId)
      .filter { it.number == suppliedTicket }

    if (matchingTickets.isEmpty()) {
      throw TicketNotFoundException(suppliedTicket)
    }
    if (matchingTickets.size > 1) {
      throw DuplicateTicketException(": $suppliedTicket")
    }

    if (foretagsbiljettService.getStatusOfTicket(matchingTickets.first()) != Företagsbiljett.Status.Available) {
      throw BadRequestException("Ticket has already been used: " + suppliedTicket.number)
    }
  }

}