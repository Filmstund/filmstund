package rocks.didit.sefilm.domain.dto

import rocks.didit.sefilm.notification.NotificationType

data class NotificationSettingsInputDTO(
  val notificationsEnabled: Boolean,
  val enabledTypes: List<NotificationType> = listOf(),
  val pushover: PushoverInputDTO?,
  val mail: MailInputDTO?
)

data class PushoverInputDTO(val enabled: Boolean, val userKey: String, val device: String?)

data class MailInputDTO(val enabled: Boolean, val mailAddress: String)
