package rocks.didit.sefilm.events

import org.springframework.context.ApplicationEvent
import rocks.didit.sefilm.database.mongo.entities.Showing
import rocks.didit.sefilm.database.mongo.entities.User
import rocks.didit.sefilm.domain.PaymentType
import rocks.didit.sefilm.domain.UserID
import rocks.didit.sefilm.notification.NotificationType

sealed class ITBioEvent(src: Any) : ApplicationEvent(src)

sealed class NotificationEvent(src: Any, val potentialRecipients: List<UserID> = listOf(), val type: NotificationType) :
  ITBioEvent(src)

/** If {@link #potentialRecipients} is empty, all users will be potential recipients */
sealed class ShowingEvent(
  src: Any,
  val showing: Showing,
  val triggeredBy: User,
  satisfiesType: NotificationType,
  potentialRecipients: List<UserID> = listOf()
) : NotificationEvent(src, potentialRecipients, satisfiesType)

class NewShowingEvent(src: Any, showing: Showing, user: User) :
  ShowingEvent(src, showing, user, NotificationType.NewShowing)

class UpdatedShowingEvent(src: Any, showing: Showing, user: User) :
  ShowingEvent(src, showing, user, NotificationType.UpdateShowing, showing.allParticipants())

class DeletedShowingEvent(src: Any, showing: Showing, user: User) :
  ShowingEvent(src, showing, user, NotificationType.DeletedShowing, showing.allParticipants())

class TicketsBoughtEvent(src: Any, showing: Showing, user: User) :
  ShowingEvent(src, showing, user, NotificationType.TicketsBought, showing.allParticipants())

class UserAttendedEvent(src: Any, showing: Showing, user: User, val paymentType: PaymentType) :
  ShowingEvent(src, showing, user, NotificationType.UserAttended, listOf(showing.admin.id))

class UserUnattendedEvent(src: Any, showing: Showing, user: User) :
  ShowingEvent(src, showing, user, NotificationType.UserUnattended, listOf(showing.admin.id))

class PushoverUserKeyInvalidEvent(src: Any, val userKey: String) : ITBioEvent(src)

private fun Showing.allParticipants() =
  this.participants.map { it.userId }
