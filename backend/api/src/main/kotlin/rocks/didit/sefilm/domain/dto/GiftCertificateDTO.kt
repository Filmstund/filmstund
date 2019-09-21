package rocks.didit.sefilm.domain.dto

import rocks.didit.sefilm.domain.TicketNumber
import java.time.LocalDate
import java.util.*

data class GiftCertificateDTO(
  val userId: UUID,
  val number: TicketNumber,
  val expiresAt: LocalDate = LocalDate.EPOCH,
  val status: Status = Status.UNKNOWN,
  val deleted: Boolean = false
) {
  constructor(userId: UUID, number: TicketNumber) : this(userId, number, LocalDate.EPOCH, Status.UNKNOWN)
  constructor(userId: UUID, number: TicketNumber, expiresAt: LocalDate, deleted: Boolean) : this(
    userId,
    number,
    expiresAt,
    Status.UNKNOWN,
    deleted
  )

  enum class Status {
    AVAILABLE, PENDING, USED, EXPIRED, UNKNOWN
  }
}