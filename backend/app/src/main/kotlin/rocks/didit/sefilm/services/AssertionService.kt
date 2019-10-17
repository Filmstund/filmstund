package rocks.didit.sefilm.services

import org.jdbi.v3.core.Jdbi
import org.jdbi.v3.core.kotlin.mapTo
import org.jdbi.v3.core.kotlin.withHandleUnchecked
import org.springframework.security.access.AccessDeniedException
import org.springframework.stereotype.Service
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
  private val jdbi: Jdbi,
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
    val hasPhone = jdbi.withHandleUnchecked {
      it.select("SELECT exists(SELECT 1 FROM users WHERE id = ? AND (phone = '') IS FALSE)", userID)
        .mapTo<Boolean>().one()
    }
    if (!hasPhone) {
      throw MissingPhoneNumberException(userID)
    }
  }

  fun assertGiftCertIsUsable(userId: UUID, suppliedTicket: TicketNumber, showing: ShowingDTO) {
    val matchingTicket = giftCertService.getGiftCertByUserIdAndNUmber(userId, suppliedTicket)
      ?: throw TicketNotFoundException(suppliedTicket)

    if (matchingTicket.expiresAt.isBefore(showing.date)) {
      throw TicketExpiredException(suppliedTicket)
    }

    if (giftCertService.getStatusOfTicket(matchingTicket) != GiftCertificateDTO.Status.AVAILABLE) {
      throw TicketAlreadyUsedException(suppliedTicket)
    }
  }
}