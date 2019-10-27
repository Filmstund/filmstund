package se.filmstund.domain.id

import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonValue

data class TicketNumber(val number: String) {
  companion object {
    @JvmStatic
    @JsonCreator
    fun from(str: String?) = str?.let { TicketNumber(it) }
  }

  init {
    require(number.length == 11) { "Ticket number has wrong size. Expected 11, got ${number.length}" }
    requireNotNull(number.toLongOrNull()) { "'$number' is an invalid ticket number" }
  }

  @JsonValue
  override fun toString() = number
}