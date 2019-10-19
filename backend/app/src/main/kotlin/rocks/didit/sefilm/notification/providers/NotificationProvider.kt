package rocks.didit.sefilm.notification.providers

import rocks.didit.sefilm.domain.dto.PublicUserDTO
import rocks.didit.sefilm.domain.id.UserID
import rocks.didit.sefilm.notification.NotificationType
import rocks.didit.sefilm.notification.ProviderSettings

interface NotificationProvider<out T : ProviderSettings> {

  /** Get the user settings related to this provider. I.e. the E-mail addresses we are going to notify */
  fun getNotifiableUsers(knownRecipients: List<UserID>): List<NotifiableUser<T>>

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

data class NotifiableUser<out T : ProviderSettings>(
  val user: PublicUserDTO,
  val notificationSettings: T,
  val enabledTypes: List<NotificationType>
) {
}
