package rocks.didit.sefilm.domain

import com.fasterxml.jackson.annotation.JsonValue
import rocks.didit.sefilm.domain.dto.ForetagsbiljettDTO
import java.time.LocalDate

data class TicketNumber(@JsonValue val number: String) {
  init {
    require(number.length == 11) { "Ticket number has wrong size. Expected 11, got ${number.length}" }
    requireNotNull(number.toLongOrNull()) { "'$number' is an invalid ticket number" }
  }

  override fun toString() = number
}

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
