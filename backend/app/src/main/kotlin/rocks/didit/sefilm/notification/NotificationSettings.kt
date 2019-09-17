package rocks.didit.sefilm.notification

data class NotificationSettings(
  val notificationsEnabled: Boolean,
  val enabledTypes: List<NotificationType>,
  val providerSettings: List<ProviderSettings>
)