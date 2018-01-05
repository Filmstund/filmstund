package rocks.didit.sefilm.domain

import com.fasterxml.jackson.annotation.JsonValue
import rocks.didit.sefilm.domain.dto.ForetagsbiljettDTO
import java.time.LocalDate

data class TicketNumber(@JsonValue val number: String) {
  init {
    if (number.length != 11) {
      throw IllegalArgumentException("Ticket number has wrong size. Expected 11, got ${number.length}")
    }
    if (number.toLongOrNull() == null) {
      throw IllegalArgumentException("'$number' is an invalid ticket number")
    }
  }

  override fun toString() = number
}

data class Företagsbiljett(val number: TicketNumber,
                           val expires: LocalDate = LocalDate.now().plusYears(1)) {

  companion object {
    fun valueOf(dto: ForetagsbiljettDTO) = Företagsbiljett(number = TicketNumber(dto.number), expires = dto.expires)
  }

  enum class Status {
    Available, Pending, Used, Expired
  }
}
