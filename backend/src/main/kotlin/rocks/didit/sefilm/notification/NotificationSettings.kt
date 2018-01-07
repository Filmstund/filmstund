package rocks.didit.sefilm.notification

/** This represents user and provider specific settings */
interface NotificationSettings {
  val enabled: Boolean
}

data class MailNotificationSettings(
  override val enabled: Boolean = false,
  val mailAddress: String? = null) : NotificationSettings

data class PushoverNotificationSettings(
  override val enabled: Boolean = false,
  val userKey: String? = null,
  val device: String? = null) : NotificationSettings
