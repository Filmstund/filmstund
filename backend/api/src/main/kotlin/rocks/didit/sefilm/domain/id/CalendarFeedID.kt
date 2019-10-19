package rocks.didit.sefilm.domain.id

import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonValue
import java.util.*

data class CalendarFeedID(val uuid: UUID) {
  companion object {
    fun random() = CalendarFeedID(UUID.randomUUID())
    fun from(uuid: UUID?): CalendarFeedID? = uuid?.let { CalendarFeedID(it) }

    @JsonCreator
    @JvmStatic
    fun from(value: String?) = value?.let { CalendarFeedID(UUID.fromString(it)) }
  }

  @JsonValue
  override fun toString(): String {
    return uuid.toString()
  }
}