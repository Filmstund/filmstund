package rocks.didit.sefilm.events

import org.springframework.context.ApplicationEvent
import rocks.didit.sefilm.database.entities.Showing
import rocks.didit.sefilm.database.entities.User
import rocks.didit.sefilm.domain.PaymentType
import rocks.didit.sefilm.notification.NotificationType

sealed class ITBioEvent(src: Any) : ApplicationEvent(src)
sealed class NotificationEvent(src: Any, val type: NotificationType) : ITBioEvent(src)
sealed class ShowingEvent(src: Any, val showing: Showing, val triggeredBy: User, satisfiesType: NotificationType)
  : NotificationEvent(src, satisfiesType)

class NewShowingEvent(src: Any, showing: Showing, user: User) : ShowingEvent(src, showing, user, NotificationType.NewShowing)
class UpdatedShowingEvent(src: Any, showing: Showing, user: User) : ShowingEvent(src, showing, user, NotificationType.UpdateShowing)
class DeletedShowingEvent(src: Any, showing: Showing, user: User) : ShowingEvent(src, showing, user, NotificationType.DeletedShowing)

class TicketsBoughtEvent(src: Any, showing: Showing, user: User) : ShowingEvent(src, showing, user, NotificationType.TicketsBought)
class UserAttendedEvent(src: Any, showing: Showing, user: User, val paymentType: PaymentType)
  : ShowingEvent(src, showing, user, NotificationType.UserAttended)

class UserUnattendedEvent(src: Any, showing: Showing, user: User) : ShowingEvent(src, showing, user, NotificationType.UserUnattended)

class PushoverUserKeyInvalidEvent(src: Any, val userKey: String) : ITBioEvent(src)
