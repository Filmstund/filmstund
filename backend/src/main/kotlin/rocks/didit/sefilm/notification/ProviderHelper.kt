package rocks.didit.sefilm.notification

import org.springframework.stereotype.Service
import rocks.didit.sefilm.Properties
import rocks.didit.sefilm.events.*
import rocks.didit.sefilm.notification.providers.NotifiableUser
import rocks.didit.sefilm.services.UserService
import kotlin.reflect.KClass
import kotlin.reflect.full.cast

@Service
class ProviderHelper(
  private val userService: UserService,
  private val properties: Properties) {

  fun <T : ProviderSettings> getNotifiableUsers(wantedSettingsType: KClass<T>): List<NotifiableUser<T>> {
    return userService.getUsersThatWantToBeNotified().mapNotNull {
      val notificationSettings
        = it.notificationSettings.providerSettings
        .filter { it.enabled && wantedSettingsType.isInstance(it) }
        .map { wantedSettingsType.cast(it) }

      when {
        notificationSettings.size > 1 -> throw IllegalStateException("Found ${notificationSettings.size} enabled notification settings of the same type. Expected 1, got the following '$notificationSettings'")
        notificationSettings.isNotEmpty() -> NotifiableUser(it.toLimitedUserDTO(), notificationSettings.first(), it.notificationSettings.enabledTypes)
        else -> null
      }
    }.filter { it.enabledTypes.isNotEmpty() }
  }

  // TODO: i18n
  fun constructMessageBasedOnEvent(event: NotificationEvent): NotificationMessage {
    return when (event) {
      is NewShowingEvent -> TODO()
      is UpdatedShowingEvent -> TODO()
      is DeletedShowingEvent -> TODO()
      is TicketsBoughtEvent -> TODO()
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
