package rocks.didit.sefilm.domain

import rocks.didit.sefilm.domain.dto.ForetagsbiljettDTO
import rocks.didit.sefilm.domain.id.TicketNumber
import java.time.LocalDate

@Deprecated("User GiftCertificateDTO instead")
data class Foretagsbiljett(
  val number: TicketNumber,
  val expires: LocalDate = LocalDate.now().plusYears(1)
) {

  companion object {
    fun valueOf(dto: ForetagsbiljettDTO) = Foretagsbiljett(number = TicketNumber(dto.number), expires = dto.expires)
  }

  enum class Status {
    Available, Pending, Used, Expired
  }
}
