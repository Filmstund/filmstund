package rocks.didit.sefilm.notification

import org.springframework.stereotype.Service
import rocks.didit.sefilm.Properties
import rocks.didit.sefilm.events.DeletedShowingEvent
import rocks.didit.sefilm.events.NewShowingEvent
import rocks.didit.sefilm.events.NotificationEvent
import rocks.didit.sefilm.events.ShowingEvent
import rocks.didit.sefilm.events.TicketsBoughtEvent
import rocks.didit.sefilm.events.UpdatedShowingEvent
import rocks.didit.sefilm.events.UserAttendedEvent
import rocks.didit.sefilm.events.UserUnattendedEvent
import rocks.didit.sefilm.notification.providers.NotifiableUser
import rocks.didit.sefilm.services.UserService
import java.util.*
import kotlin.reflect.KClass

@Service
class ProviderHelper(
  private val userService: UserService,
  private val properties: Properties
) {

  fun <T : ProviderSettings> getNotifiableUsers(
    knownRecipients: List<UUID>,
    wantedSettingsType: KClass<T>
  ): List<NotifiableUser<T>> = emptyList() /*{
    return userService.getUsersThatWantToBeNotified(knownRecipients).mapNotNull {
      val notificationSettings = it.notificationSettings.providerSettings
        .filter { it.enabled && wantedSettingsType.isInstance(it) }
        .map { wantedSettingsType.cast(it) }

      when {
        notificationSettings.size > 1 -> throw IllegalStateException("Found ${notificationSettings.size} enabled notification settings of the same type. Expected 1, got the following '$notificationSettings'")
        notificationSettings.isNotEmpty() -> NotifiableUser(
          it.toPublicUserDTO(),
          notificationSettings.first(),
          it.notificationSettings.enabledTypes
        )
        else -> null
      }
    }.filter { it.enabledTypes.isNotEmpty() }
  }
*/
  // TODO: i18n
  fun constructMessageBasedOnEvent(event: NotificationEvent): NotificationMessage {
    return when (event) {
      is NewShowingEvent -> newShowingMessage(event)
      is UpdatedShowingEvent -> updatedShowingMessage(event)
      is DeletedShowingEvent -> deletedShowingMessage(event)
      is TicketsBoughtEvent -> ticketsBoughtMessage(event)
      is UserAttendedEvent -> userAttendedMessage(event)
      is UserUnattendedEvent -> userUnattendedMessage(event)
    }
  }

  private fun newShowingMessage(event: NewShowingEvent): NotificationMessage {
    return formatMsg(
      title = "A showing for ${event.showing.movie.title} has been created",
      msg = "Time: ${event.showing.date} ${event.showing.time}.\nLocation: ${event.showing.location?.name}",
      event = event
    )
  }

  private fun updatedShowingMessage(event: UpdatedShowingEvent): NotificationMessage {
    return formatMsg(
      title = "The showing for ${event.showing.movie.title} has been updated",
      msg = "Time: ${event.showing.time}.\nLocation: ${event.showing.location?.name}", event = event
    )
  }

  private fun deletedShowingMessage(event: DeletedShowingEvent): NotificationMessage {
    return formatMsg(
      title = "The showing for ${event.showing.movie.title} has been removed",
      msg = "Sad panda :(", event = event
    )
  }

  private fun ticketsBoughtMessage(event: TicketsBoughtEvent): NotificationMessage {
    return formatMsg(
      title = "Tickets bought for ${event.showing.movie.title}",
      msg = "Price ${event.showing.price.toKronor()} SEK. Pay to ${event.showing.payToUser.phone}", event = event
    )
  }

  private fun userAttendedMessage(event: UserAttendedEvent): NotificationMessage {
    return formatMsg(
      title = "${event.triggeredBy.nick} attended showing",
      msg = "${event.triggeredBy.nick} has attended your showing. Chosen payment type: ${event.paymentType}",
      event = event
    )
  }

  private fun userUnattendedMessage(event: UserUnattendedEvent): NotificationMessage {
    return formatMsg(
      title = "User unattended showing",
      msg = "${event.triggeredBy.nick} has chosen to unattended your showing", event = event
    )
  }

  private fun formatMsg(title: String, msg: String, event: ShowingEvent): NotificationMessage {
    return NotificationMessage(
      title = title,
      message = msg,
      url = formatShowingUrl(event),
      urlTitle = "View showing"
    )
  }

  private fun formatShowingUrl(event: ShowingEvent) =
    "${properties.baseUrl.frontend}/showings/${event.showing.id}"

  data class NotificationMessage(val title: String, val message: String, val url: String, val urlTitle: String)
}
