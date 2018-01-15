package rocks.didit.sefilm.events

import org.springframework.context.ApplicationEvent
import rocks.didit.sefilm.database.entities.Showing
import rocks.didit.sefilm.database.entities.User
import rocks.didit.sefilm.domain.PaymentType

sealed class ITBioEvent(src: Any) : ApplicationEvent(src)
sealed class NotificationEvent(src: Any) : ITBioEvent(src)
sealed class ShowingEvent(src: Any, val showing: Showing, val triggeredBy: User) : NotificationEvent(src)

class NewShowingEvent(src: Any, showing: Showing, user: User) : ShowingEvent(src, showing, user)
class UpdatedShowingEvent(src: Any, showing: Showing, user: User) : ShowingEvent(src, showing, user)
class DeletedShowingEvent(src: Any, showing: Showing, user: User) : ShowingEvent(src, showing, user)

class TicketsBoughtEvent(src: Any, showing: Showing, user: User) : ShowingEvent(src, showing, user)
class UserAttendedEvent(src: Any, showing: Showing, user: User, val paymentType: PaymentType) : ShowingEvent(src, showing, user)
class UserUnattendedEvent(src: Any, showing: Showing, user: User) : ShowingEvent(src, showing, user)

class PushoverUserKeyInvalidEvent(src: Any, val userKey: String) : ITBioEvent(src)
