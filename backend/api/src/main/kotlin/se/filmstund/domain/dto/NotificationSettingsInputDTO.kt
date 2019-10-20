package se.filmstund.domain.dto

import se.filmstund.notification.NotificationType

data class NotificationSettingsInputDTO(
  val notificationsEnabled: Boolean,
  val enabledTypes: List<NotificationType> = listOf(),
  val pushover: PushoverInputDTO?,
  val mail: MailInputDTO?
)

data class PushoverInputDTO(val enabled: Boolean, val userKey: String, val device: String?)

data class MailInputDTO(val enabled: Boolean, val mailAddress: String)
