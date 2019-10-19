package rocks.didit.sefilm.services

import org.jdbi.v3.core.Jdbi
import org.jdbi.v3.core.kotlin.mapTo
import org.jdbi.v3.core.kotlin.withHandleUnchecked
import org.springframework.security.access.AccessDeniedException
import org.springframework.stereotype.Service
import rocks.didit.sefilm.FilmstadenTicketException
import rocks.didit.sefilm.MissingPhoneNumberException
import rocks.didit.sefilm.TicketAlreadyUsedException
import rocks.didit.sefilm.TicketExpiredException
import rocks.didit.sefilm.TicketNotFoundException
import rocks.didit.sefilm.TicketsAlreadyBoughtException
import rocks.didit.sefilm.currentLoggedInUser
import rocks.didit.sefilm.domain.dto.GiftCertificateDTO
import rocks.didit.sefilm.domain.dto.core.ShowingDTO
import rocks.didit.sefilm.domain.id.TicketNumber
import rocks.didit.sefilm.domain.id.UserID
import java.util.*

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

    if (matchingTicket.expiresAt.isBefore(showing.date)) {
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