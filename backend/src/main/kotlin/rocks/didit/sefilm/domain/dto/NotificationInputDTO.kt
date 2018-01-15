package rocks.didit.sefilm.domain.dto

import rocks.didit.sefilm.notification.NotificationType

data class NotificationInputDTO(
  val enabledNotifications: List<NotificationType> = listOf(),
  val pushover: PushoverInputDTO?,
  val mail: MailInputDTO?
)

data class PushoverInputDTO(val enabled: Boolean, val userKey: String, val device: String?)

data class MailInputDTO(val enabled: Boolean, val mail: String)
