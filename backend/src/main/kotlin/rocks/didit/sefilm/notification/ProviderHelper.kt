package rocks.didit.sefilm.notification

import org.springframework.stereotype.Service
import rocks.didit.sefilm.Properties
import rocks.didit.sefilm.events.*
import rocks.didit.sefilm.services.UserService
import kotlin.reflect.KClass

@Service
class ProviderHelper(
  private val userService: UserService,
  private val properties: Properties) {

  fun <T : NotificationSettings> getNotifiable(userSettings: KClass<T>): List<T> {
    return userService
      .getUsersThatWantToBeNotified()
      .flatMap { it.notificationSettings }
      .filterIsInstance(userSettings.java)
  }

  // TODO: i18n
  fun constructMessageBasedOnEvent(event: NotificationEvent): NotificationMessage {
    return when (event) {
      is NewShowingEvent -> TODO()
      is UpdatedShowingEvent -> TODO()
      is DeletedShowingEvent -> TODO()
      is TicketsBoughtEvent -> TODO()
      is TicketsAddedEvent -> TODO()
      is UserAttendedEvent -> userAttendedMessage(event)
      is UserUnattendedEvent -> userUnattendedMessage(event)
    }
  }

  private fun userAttendedMessage(event: UserAttendedEvent): NotificationMessage {
    return NotificationMessage(title = "User attended showing",
      message = "${event.triggeredBy.nick} has attended your showing. Chosen payment type: ${event.paymentType}",
      url = formatShowingUrl(event),
      urlTitle = "View showing")
  }

  private fun userUnattendedMessage(event: UserUnattendedEvent): NotificationMessage {
    return NotificationMessage(title = "User unattended showing",
      message = "${event.triggeredBy.nick} has chosen to unattended your showing",
      url = formatShowingUrl(event),
      urlTitle = "View showing")
  }

  private fun formatShowingUrl(event: ShowingEvent) =
    "${properties.baseUrl.frontend}/showings/${event.showing.id}"

  data class NotificationMessage(val title: String, val message: String, val url: String, val urlTitle: String)
}
