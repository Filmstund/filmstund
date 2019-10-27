package se.filmstund.domain.dto.input

import se.filmstund.domain.dto.GiftCertificateDTO
import se.filmstund.domain.id.TicketNumber
import se.filmstund.domain.id.UserID
import java.time.LocalDate

data class GiftCertificateInputDTO(
  val number: TicketNumber,
  val expiresAt: LocalDate = LocalDate.ofEpochDay(0)
) {
  fun toGiftCertificateDTO(userID: UserID): GiftCertificateDTO {
    return GiftCertificateDTO(userID, number, expiresAt)
  }
}
