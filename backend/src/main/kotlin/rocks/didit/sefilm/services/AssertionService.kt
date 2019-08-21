package rocks.didit.sefilm.services

import org.springframework.security.access.AccessDeniedException
import org.springframework.stereotype.Service
import rocks.didit.sefilm.*
import rocks.didit.sefilm.database.entities.Showing
import rocks.didit.sefilm.domain.Foretagsbiljett
import rocks.didit.sefilm.domain.TicketNumber
import rocks.didit.sefilm.domain.UserID
import rocks.didit.sefilm.domain.dto.ShowingDTO

@Service
class AssertionService(
        private val userService: UserService,
        private val foretagsbiljettService: ForetagsbiljettService
) {

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
        if (currentLoggedInUserId() != showingAdmin) {
            throw AccessDeniedException("Only the showing admin is allowed to do that")
        }
    }

    fun assertUserHasPhoneNumber(userID: UserID) {
        val user = userService.getUserOrThrow(userID)
        if (user.phone == null || user.phone.isBlank()) {
            throw MissingPhoneNumberException(userID)
        }
    }

    fun assertForetagsbiljettIsUsable(userId: UserID, suppliedTicket: TicketNumber, showing: Showing) {
        val matchingTickets = foretagsbiljettService
                .getForetagsbiljetterForUser(userId)
                .filter { it.number == suppliedTicket }

        if (matchingTickets.isEmpty()) {
            throw TicketNotFoundException(suppliedTicket)
        }
        if (matchingTickets.size > 1) {
            throw DuplicateTicketException(": $suppliedTicket")
        }

        if (foretagsbiljettService.getStatusOfTicket(matchingTickets.first()) != Foretagsbiljett.Status.Available) {
            throw TicketAlreadyUsedException(suppliedTicket)
        }

        if (matchingTickets.first().expires.isBefore(showing.expectedBuyDate ?: showing.date)) {
            throw TicketExpiredException(suppliedTicket)
        }
    }
}