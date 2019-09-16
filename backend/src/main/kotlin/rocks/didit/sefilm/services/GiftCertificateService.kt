package rocks.didit.sefilm.services

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import rocks.didit.sefilm.NotFoundException
import rocks.didit.sefilm.TicketAlreadyInUserException
import rocks.didit.sefilm.TicketInUseException
import rocks.didit.sefilm.TicketNotFoundException
import rocks.didit.sefilm.currentLoggedInUser
import rocks.didit.sefilm.database.entities.GiftCertId
import rocks.didit.sefilm.database.entities.GiftCertificate
import rocks.didit.sefilm.database.repositories.GiftCertificateRepository
import rocks.didit.sefilm.database.repositories.ParticipantRepository
import rocks.didit.sefilm.database.repositories.UserRepository
import rocks.didit.sefilm.domain.TicketNumber
import rocks.didit.sefilm.domain.dto.ForetagsbiljettDTO
import rocks.didit.sefilm.domain.dto.GiftCertificateDTO
import java.time.LocalDate
import java.util.*

@Service
class GiftCertificateService(
  private val giftCertRepo: GiftCertificateRepository,
  private val userRepository: UserRepository,
  private val participantRepo: ParticipantRepository
) {

  @Transactional
  fun getStatusOfTicket(ticket: GiftCertificateDTO): GiftCertificateDTO.Status {
    if (ticket.expiresAt <= LocalDate.now()) {
      return GiftCertificateDTO.Status.EXPIRED
    }

    val participantHasUsedTicket = participantRepo.findByGiftCertificateUsed_Id_Number(ticket.number)
      ?: return GiftCertificateDTO.Status.AVAILABLE

    return if (participantHasUsedTicket.showing.ticketsBought) {
      GiftCertificateDTO.Status.USED
    } else {
      GiftCertificateDTO.Status.PENDING
    }
  }

  fun getGiftCertsByUserId(userID: UUID): List<GiftCertificateDTO> =
    giftCertRepo.findGiftCertificateDTOByUserId(userID)

  fun addForetagsbiljetterToCurrentUser(biljetter: List<ForetagsbiljettDTO>) {
    val currentUser = userRepository.findById(currentLoggedInUser().id)
      .orElseThrow { NotFoundException("current user", currentLoggedInUser().id) }

    assertForetagsbiljetterNotAlreadyInUse(biljetter, currentUser.giftCertificates)

    val newTickets = biljetter.map { GiftCertificate(GiftCertId(currentUser, TicketNumber(it.number)), it.expires) }
    giftCertRepo.saveAll(newTickets)
  }

  @Transactional
  fun deleteTicketFromUser(biljett: ForetagsbiljettDTO) {
    val currentUser = userRepository.findById(currentLoggedInUser().id)
      .orElseThrow { NotFoundException("current user", currentLoggedInUser().id) }

    val ticketNumber = TicketNumber(biljett.number)
    val giftCert = giftCertRepo.findById(GiftCertId(currentUser, ticketNumber))
      .orElseThrow { throw TicketNotFoundException(ticketNumber) }

    assertTicketIsntPending(giftCert)

    currentUser.giftCertificates.remove(giftCert)
  }

  /** The tickets are allowed to be in use by the current user. */
  private fun assertForetagsbiljetterNotAlreadyInUse(
    biljetter: List<ForetagsbiljettDTO>,
    userBiljetter: List<GiftCertificate>
  ) {
    biljetter.forEach {
      val ticketNumber = TicketNumber(it.number)
      if (!userBiljetter.any { t -> t.id.number == ticketNumber }
        && giftCertRepo.existsById_Number(ticketNumber)) {
        throw TicketAlreadyInUserException(currentLoggedInUser().id)
      }
    }
  }

  private fun assertTicketIsntPending(ticket: GiftCertificate) {
    if (getStatusOfTicket(ticket.toDTO()) == GiftCertificateDTO.Status.PENDING) {
      throw TicketInUseException(ticket.id.number)
    }
  }
}