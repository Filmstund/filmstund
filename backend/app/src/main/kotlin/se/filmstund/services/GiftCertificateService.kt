package se.filmstund.services

import org.jdbi.v3.core.Jdbi
import org.jdbi.v3.core.kotlin.mapTo
import org.jdbi.v3.core.kotlin.useTransactionUnchecked
import org.jdbi.v3.core.kotlin.withHandleUnchecked
import org.springframework.stereotype.Service
import se.filmstund.TicketAlreadyInUserException
import se.filmstund.TicketInUseException
import se.filmstund.TicketNotFoundException
import se.filmstund.currentLoggedInUser
import se.filmstund.database.dao.UserDao
import se.filmstund.domain.dto.GiftCertificateDTO
import se.filmstund.domain.dto.input.GiftCertificateInputDTO
import se.filmstund.domain.id.TicketNumber
import se.filmstund.domain.id.UserID
import java.time.LocalDate

@Service
class GiftCertificateService(private val jdbi: Jdbi, private val userDao: UserDao) {

  fun getStatusOfTicket(ticket: GiftCertificateDTO): GiftCertificateDTO.Status {
    if (ticket.expiresAt <= LocalDate.now()) {
      return GiftCertificateDTO.Status.EXPIRED
    }

    return jdbi.withHandleUnchecked {
      val hasPaid = it.select("SELECT has_paid FROM attendee WHERE gift_certificate_used = ?", ticket.number)
        .mapTo<Boolean>()
        .findOne().orElse(null)

      when (hasPaid) {
        null -> // No attendee with this ticket
          GiftCertificateDTO.Status.AVAILABLE
        true -> // Attached to a attendee and bought/used
          GiftCertificateDTO.Status.USED
        false -> // Attached to a attendee, but not bought yet
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

  fun addGiftCertsToCurrentUser(newCerts: List<GiftCertificateInputDTO>) {
    jdbi.useTransactionUnchecked {
      val userDao = it.attach(UserDao::class.java)
      val user = currentLoggedInUser()
      val gcs = newCerts.map { gc -> gc.toGiftCertificateDTO(user.id) }

      assertGiftCertsNotAlreadyInUse(userDao, gcs)
      userDao.insertGiftCertificates(gcs)
    }
  }

  fun deleteTicketFromUser(giftCert: GiftCertificateInputDTO) {
    jdbi.useTransactionUnchecked {
      val userDao = it.attach(UserDao::class.java)

      val currentUserId = currentLoggedInUser().id
      val dbGc = userDao.findGiftCertByUserAndNumber(currentUserId, giftCert.number)
        ?: throw TicketNotFoundException(giftCert.number)

      assertTicketIsntPending(giftCert.toGiftCertificateDTO(currentUserId))
      userDao.deleteGiftCertByUserAndNumber(currentUserId, dbGc.number)
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