package rocks.didit.sefilm.domain.dto

import rocks.didit.sefilm.database.entities.Location
import java.time.LocalDateTime


data class CalendarEventDTO(val summary: String,
                            val location: Location? = null,
                            val emails: Collection<String>,
                            val start: LocalDateTime,
                            val end: LocalDateTime)