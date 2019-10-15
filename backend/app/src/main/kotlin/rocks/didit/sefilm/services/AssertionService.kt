package rocks.didit.sefilm.services

import org.springframework.security.access.AccessDeniedException
import org.springframework.stereotype.Service
import rocks.didit.sefilm.DuplicateTicketException
import rocks.didit.sefilm.MissingPhoneNumberException
import rocks.didit.sefilm.TicketAlreadyUsedException
import rocks.didit.sefilm.TicketExpiredException
import rocks.didit.sefilm.TicketNotFoundException
import rocks.didit.sefilm.TicketsAlreadyBoughtException
import rocks.didit.sefilm.currentLoggedInUser
import rocks.didit.sefilm.domain.TicketNumber
import rocks.didit.sefilm.domain.dto.GiftCertificateDTO
import rocks.didit.sefilm.domain.dto.core.ShowingDTO
import java.util.*

@Service
class AssertionService(
  private val userService: UserService,
  private val giftCertService: GiftCertificateService
) {

  fun assertTicketsNotBought(userID: UUID, showing: ShowingDTO) {
    if (showing.ticketsBought) {
      throw TicketsAlreadyBoughtException(userID, showing.id)
    }
  }

  fun assertLoggedInUserIsAdmin(showing: ShowingDTO) = assertLoggedInUserIsAdmin(showing.admin)
  fun assertLoggedInUserIsAdmin(showingAdmin: UUID) {
    if (currentLoggedInUser().id != showingAdmin) {
      throw AccessDeniedException("Only the showing admin is allowed to do that")
    }
  }

  fun assertUserHasPhoneNumber(userID: UUID) {
    val user = userService.getUserOrThrow(userID)
    if (user.phone.isNullOrBlank()) {
      throw MissingPhoneNumberException(userID)
    }
  }

  fun assertForetagsbiljettIsUsable(userId: UUID, suppliedTicket: TicketNumber, showing: ShowingDTO) {
    val matchingTickets = giftCertService
      .getGiftCertsByUserId(userId)
      .filter { it.number == suppliedTicket }

    if (matchingTickets.isEmpty()) {
      throw TicketNotFoundException(suppliedTicket)
    }
    if (matchingTickets.size > 1) {
      throw DuplicateTicketException(": $suppliedTicket")
    }

    if (giftCertService.getStatusOfTicket(matchingTickets.first()) != GiftCertificateDTO.Status.AVAILABLE) {
      throw TicketAlreadyUsedException(suppliedTicket)
    }

    if (matchingTickets.first().expiresAt.isBefore(showing.date)) {
      throw TicketExpiredException(suppliedTicket)
    }
  }
}