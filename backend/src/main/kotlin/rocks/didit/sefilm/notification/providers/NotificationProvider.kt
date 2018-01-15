package rocks.didit.sefilm.notification.providers

import rocks.didit.sefilm.domain.dto.LimitedUserDTO
import rocks.didit.sefilm.events.*
import rocks.didit.sefilm.notification.NotificationSettings
import rocks.didit.sefilm.notification.NotificationType

interface NotificationProvider<out T : NotificationSettings> {

  /** Get the user settings related to this provider. I.e. the E-mail addresses we are going to notify */
  fun getNotifiableUsers(): List<NotifiableUser<T>>

  /** Nice name of the service, i.e. Pushbullet, or E-Mail */
  val name: String

  /** Should the service be subscribable, i.e. visible to end users in the frontend */
  val isSubscribable: Boolean
}

data class NotificationProviderDTO(
  val name: String,
  val isSubscribable: Boolean
) {
  companion object {
    fun from(provider: NotificationProvider<*>): NotificationProviderDTO {
      return NotificationProviderDTO(provider.name, provider.isSubscribable)
    }
  }
}

data class NotifiableUser<out T : NotificationSettings>(
  val user: LimitedUserDTO,
  val notificationSettings: T,
  val enabledNotifications: List<NotificationType>) {

  fun isInterestedInEvent(event: NotificationEvent): Boolean {
    return when (event) {
      is NewShowingEvent -> this.enabledNotifications.contains(NotificationType.NewShowing)
      is UpdatedShowingEvent -> this.enabledNotifications.contains(NotificationType.UpdateShowing)
      is DeletedShowingEvent -> this.enabledNotifications.contains(NotificationType.DeletedShowing)
      is TicketsBoughtEvent -> this.enabledNotifications.contains(NotificationType.TicketsBought)
      is UserAttendedEvent -> this.enabledNotifications.contains(NotificationType.UserAttended)
      is UserUnattendedEvent -> this.enabledNotifications.contains(NotificationType.UserUnattended)
    }
  }
}
