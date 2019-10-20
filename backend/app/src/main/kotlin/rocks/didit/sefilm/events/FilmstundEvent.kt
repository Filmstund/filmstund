package rocks.didit.sefilm.events

import rocks.didit.sefilm.domain.dto.PublicUserDTO
import rocks.didit.sefilm.domain.dto.core.AttendeeDTO
import rocks.didit.sefilm.domain.dto.core.ShowingDTO
import java.time.Instant

sealed class FilmstundEvent(val triggeredBy: PublicUserDTO?, val timestamp: Instant = Instant.now())

sealed class ShowingEvent(
  val showing: ShowingDTO,
  triggeredBy: PublicUserDTO
) : FilmstundEvent(triggeredBy)

class NewShowingEvent(showing: ShowingDTO, triggeredBy: PublicUserDTO) : ShowingEvent(showing, triggeredBy)

class UpdatedShowingEvent(
  showing: ShowingDTO,
  val showingBeforeUpdate: ShowingDTO,
  triggeredBy: PublicUserDTO
) : ShowingEvent(showing, triggeredBy)

class DeletedShowingEvent(showing: ShowingDTO, triggerBy: PublicUserDTO) : ShowingEvent(showing, triggerBy)

class TicketsBoughtEvent(showing: ShowingDTO, triggeredBy: PublicUserDTO) : ShowingEvent(showing, triggeredBy)

class UserAttendedEvent(
  showing: ShowingDTO,
  val attendee: AttendeeDTO,
  triggeredBy: PublicUserDTO
) : ShowingEvent(showing, triggeredBy)

class UserUnattendedEvent(showing: ShowingDTO, triggeredBy: PublicUserDTO) : ShowingEvent(showing, triggeredBy)

class PushoverUserKeyInvalidEvent(val userKey: String) : FilmstundEvent(null)

