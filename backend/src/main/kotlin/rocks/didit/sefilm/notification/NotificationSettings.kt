package rocks.didit.sefilm.notification

import rocks.didit.sefilm.services.external.UserKeyStatus

/** This represents user and provider specific settings */
interface NotificationSettings {
  val enabled: Boolean
}

data class MailNotificationSettings(
  override val enabled: Boolean = false,
  val mailAddress: String? = null) : NotificationSettings

data class PushoverNotificationSettings(
  override val enabled: Boolean = false,
  val userKey: String = "<N/A>",
  val device: String? = null,
  val userKeyStatus: UserKeyStatus = UserKeyStatus.UNKNOWN) : NotificationSettings

