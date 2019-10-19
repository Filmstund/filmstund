package rocks.didit.sefilm.domain.dto

import rocks.didit.sefilm.domain.id.TicketNumber
import rocks.didit.sefilm.domain.id.UserID
import java.time.LocalDate

data class GiftCertificateDTO(
  val userId: UserID,
  val number: TicketNumber,
  val expiresAt: LocalDate = LocalDate.ofEpochDay(0),
  val status: Status = Status.UNKNOWN
) {
  constructor(userId: UserID, number: TicketNumber) : this(userId, number, LocalDate.ofEpochDay(0), Status.UNKNOWN)
  constructor(userId: UserID, number: TicketNumber, expiresAt: LocalDate) : this(
    userId,
    number,
    expiresAt,
    Status.UNKNOWN
  )

  enum class Status {
    AVAILABLE, PENDING, USED, EXPIRED, UNKNOWN
  }
}