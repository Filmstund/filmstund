package rocks.didit.sefilm.domain.id

import com.fasterxml.jackson.annotation.JsonValue

data class TicketNumber(@JsonValue val number: String) {
  init {
    require(number.length == 11) { "Ticket number has wrong size. Expected 11, got ${number.length}" }
    requireNotNull(number.toLongOrNull()) { "'$number' is an invalid ticket number" }
  }

  override fun toString() = number
}