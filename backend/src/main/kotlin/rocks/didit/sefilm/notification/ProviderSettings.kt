package rocks.didit.sefilm.notification

import rocks.didit.sefilm.services.external.PushoverValidationStatus

/** This represents user and provider specific settings */
interface ProviderSettings {
  val enabled: Boolean
}

data class MailSettings(
  override val enabled: Boolean = false,
  val mailAddress: String? = null
) : ProviderSettings

data class PushoverSettings(
  override val enabled: Boolean = false,
  val userKey: String = "",
  val device: String? = null,
  val userKeyStatus: PushoverValidationStatus = PushoverValidationStatus.UNKNOWN
) : ProviderSettings

