package se.filmstund.services

import org.jdbi.v3.core.Jdbi
import org.jdbi.v3.core.kotlin.mapTo
import org.jdbi.v3.core.kotlin.withHandleUnchecked
import org.springframework.security.access.AccessDeniedException
import org.springframework.stereotype.Service
import se.filmstund.FilmstadenTicketException
import se.filmstund.MissingPhoneNumberException
import se.filmstund.TicketAlreadyUsedException
import se.filmstund.TicketExpiredException
import se.filmstund.TicketNotFoundException
import se.filmstund.TicketsAlreadyBoughtException
import se.filmstund.currentLoggedInUser
import se.filmstund.domain.dto.core.GiftCertificateDTO
import se.filmstund.domain.dto.core.ShowingDTO
import se.filmstund.domain.id.TicketNumber
import se.filmstund.domain.id.UserID
import java.time.LocalDate

@Service
class AssertionService(
  private val jdbi: Jdbi,
  private val giftCertService: GiftCertificateService
) {

  fun assertTicketsNotBought(userID: UserID, showing: ShowingDTO) {
    if (showing.ticketsBought) {
      throw TicketsAlreadyBoughtException(userID, showing.id)
    }
  }

  fun assertLoggedInUserIsAdmin(showing: ShowingDTO) = assertLoggedInUserIsAdmin(showing.admin)
  fun assertLoggedInUserIsAdmin(showingAdmin: UserID) {
    if (currentLoggedInUser().id != showingAdmin) {
      throw AccessDeniedException("Only the showing admin is allowed to do that")
    }
  }

  fun assertUserHasPhoneNumber(userID: UserID) {
    val hasPhone = jdbi.withHandleUnchecked {
      it.select("SELECT exists(SELECT 1 FROM users WHERE id = ? AND (phone = '') IS FALSE)", userID)
        .mapTo<Boolean>().one()
    }
    if (!hasPhone) {
      throw MissingPhoneNumberException(userID)
    }
  }

  fun assertGiftCertIsUsable(userId: UserID, suppliedTicket: TicketNumber, showing: ShowingDTO) {
    val matchingTicket = giftCertService.getGiftCertByUserIdAndNUmber(userId, suppliedTicket)
      ?: throw TicketNotFoundException(suppliedTicket)

    if (matchingTicket.expiresAt.isBefore(LocalDate.now().plusDays(1))) {
      throw TicketExpiredException(suppliedTicket)
    }

    if (giftCertService.getStatusOfTicket(matchingTicket) != GiftCertificateDTO.Status.AVAILABLE) {
      throw TicketAlreadyUsedException(suppliedTicket)
    }
  }

  fun validateFilmstadenTicketUrls(links: List<String>) {
    val linkRegex = Regex(".+filmstaden\\.se/bokning/mina-e-biljetter/Sys.+?/AA.+?/RE.+")
    links.forEach {
      if (!it.matches(linkRegex)) {
        throw FilmstadenTicketException("$it does not look like a valid ticket link. The link should look like this: https://www.filmstaden.se/bokning/mina-e-biljetter/Sys99-SE/AA-1036-201908221930/RE-99RBBT0ZP6")
      }
    }
  }
}