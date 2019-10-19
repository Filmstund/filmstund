package rocks.didit.sefilm.events

import org.springframework.context.ApplicationEvent
import rocks.didit.sefilm.domain.PaymentType
import rocks.didit.sefilm.domain.dto.core.MovieDTO
import rocks.didit.sefilm.domain.dto.core.ShowingDTO
import rocks.didit.sefilm.domain.dto.core.UserDTO
import rocks.didit.sefilm.domain.id.UserID
import rocks.didit.sefilm.notification.NotificationType

sealed class ITBioEvent(src: Any) : ApplicationEvent(src)

sealed class NotificationEvent(src: Any, val potentialRecipients: List<UserID> = listOf(), val type: NotificationType) :
  ITBioEvent(src)

/** If {@link #potentialRecipients} is empty, all users will be potential recipients */
sealed class ShowingEvent(
  src: Any,
  val showing: ShowingDTO,
  val movie: MovieDTO,
  val admin: UserDTO,
  val triggeredBy: UserDTO,
  satisfiesType: NotificationType,
  potentialRecipients: List<UserID> = listOf()
) : NotificationEvent(src, potentialRecipients, satisfiesType)

class NewShowingEvent(src: Any, showing: ShowingDTO, movie: MovieDTO, admin: UserDTO, triggeredBy: UserDTO) :
  ShowingEvent(src, showing, movie, admin, triggeredBy, NotificationType.NewShowing)

class UpdatedShowingEvent(src: Any, showing: ShowingDTO, val originalShowing: ShowingDTO, movie: MovieDTO, admin: UserDTO, triggeredBy: UserDTO) :
  ShowingEvent(src, showing, movie, admin, triggeredBy, NotificationType.UpdateShowing, listOf())

class DeletedShowingEvent(src: Any, showing: ShowingDTO, movie: MovieDTO, admin: UserDTO, triggerdBy: UserDTO) :
  ShowingEvent(src, showing, movie, admin, triggerdBy, NotificationType.DeletedShowing, listOf())

class TicketsBoughtEvent(src: Any, showing: ShowingDTO, movie: MovieDTO, admin: UserDTO, triggeredBy: UserDTO) :
  ShowingEvent(src, showing, movie, admin, triggeredBy, NotificationType.TicketsBought, listOf())

class UserAttendedEvent(src: Any, showing: ShowingDTO, movie: MovieDTO, admin: UserDTO, triggeredBy: UserDTO, val paymentType: PaymentType) :
  ShowingEvent(src, showing, movie, admin, triggeredBy, NotificationType.UserAttended, listOf(showing.admin))

class UserUnattendedEvent(src: Any, showing: ShowingDTO, movie: MovieDTO, admin: UserDTO, triggeredBy: UserDTO) :
  ShowingEvent(src, showing, movie, admin, triggeredBy, NotificationType.UserUnattended, listOf(showing.admin))

class PushoverUserKeyInvalidEvent(src: Any, val userKey: String) : ITBioEvent(src)

