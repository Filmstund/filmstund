package rocks.didit.sefilm.services

import org.jdbi.v3.core.Jdbi
import org.jdbi.v3.core.kotlin.mapTo
import org.jdbi.v3.core.kotlin.useTransactionUnchecked
import org.jdbi.v3.core.kotlin.withHandleUnchecked
import org.springframework.stereotype.Service
import rocks.didit.sefilm.TicketAlreadyInUserException
import rocks.didit.sefilm.TicketInUseException
import rocks.didit.sefilm.TicketNotFoundException
import rocks.didit.sefilm.currentLoggedInUser
import rocks.didit.sefilm.database.dao.UserDao
import rocks.didit.sefilm.domain.dto.GiftCertificateDTO
import rocks.didit.sefilm.domain.id.TicketNumber
import rocks.didit.sefilm.domain.id.UserID
import java.time.LocalDate

@Service
class GiftCertificateService(private val jdbi: Jdbi, private val userDao: UserDao) {

  fun getStatusOfTicket(ticket: GiftCertificateDTO): GiftCertificateDTO.Status {
    if (ticket.expiresAt <= LocalDate.now()) {
      return GiftCertificateDTO.Status.EXPIRED
    }

    return jdbi.withHandleUnchecked {
      val hasPaid = it.select("SELECT has_paid FROM participant WHERE gift_certificate_used = ?", ticket.number)
        .mapTo<Boolean>()
        .findOne().orElse(null)

      when (hasPaid) {
        null -> // No participant with this ticket
          GiftCertificateDTO.Status.AVAILABLE
        true -> // Attached to a participant and bought/used
          GiftCertificateDTO.Status.USED
        false -> // Attached to a participant, but not bought yet
          GiftCertificateDTO.Status.PENDING
      }
    }
  }

  fun getGiftCertsByUserId(userID: UserID): List<GiftCertificateDTO> {
    return userDao.findGiftCertByUser(userID)
  }

  fun getGiftCertByUserIdAndNUmber(userID: UserID, number: TicketNumber): GiftCertificateDTO? {
    return userDao.findGiftCertByUserAndNumber(userID, number)
  }

  fun addGiftCertsToCurrentUser(newCerts: List<GiftCertificateDTO>) {
    jdbi.useTransactionUnchecked {
      val userDao = it.attach(UserDao::class.java)

      assertGiftCertsNotAlreadyInUse(userDao, newCerts)
      userDao.insertGiftCertificates(newCerts)
    }
  }

  fun deleteTicketFromUser(giftCert: GiftCertificateDTO) {
    jdbi.useTransactionUnchecked {
      val userDao = it.attach(UserDao::class.java)

      val dbGc = userDao.findGiftCertByUserAndNumber(currentLoggedInUser().id, giftCert.number)
        ?: throw TicketNotFoundException(giftCert.number)

      assertTicketIsntPending(giftCert)
      userDao.deleteGiftCertByUserAndNumber(currentLoggedInUser().id, dbGc.number)
    }
  }

  /** The tickets are allowed to be in use by the current user. */
  private fun assertGiftCertsNotAlreadyInUse(userDao: UserDao, newGiftCerts: List<GiftCertificateDTO>) {
    if (userDao.existGiftCertsByNumbers(newGiftCerts.map { it.number })) {
      throw TicketAlreadyInUserException(currentLoggedInUser().id)
    }
  }

  private fun assertTicketIsntPending(giftCert: GiftCertificateDTO) {
    if (getStatusOfTicket(giftCert) == GiftCertificateDTO.Status.PENDING) {
      throw TicketInUseException(giftCert.number)
    }
  }
}