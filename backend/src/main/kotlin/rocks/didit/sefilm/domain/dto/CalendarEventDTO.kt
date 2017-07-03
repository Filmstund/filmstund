package rocks.didit.sefilm.domain.dto

import rocks.didit.sefilm.database.entities.Location
import java.time.ZonedDateTime

data class CalendarEventDTO(val summary: String,
                            val location: Location? = null,
                            val emails: Collection<String>,
                            val start: ZonedDateTime,
                            val end: ZonedDateTime)