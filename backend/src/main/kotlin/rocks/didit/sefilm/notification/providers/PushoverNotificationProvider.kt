package rocks.didit.sefilm.notification.providers

import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.context.ApplicationListener
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Component
import rocks.didit.sefilm.domain.UserID
import rocks.didit.sefilm.events.NotificationEvent
import rocks.didit.sefilm.notification.ProviderHelper
import rocks.didit.sefilm.notification.PushoverSettings
import rocks.didit.sefilm.services.external.PushoverService
import rocks.didit.sefilm.services.external.PushoverValidationStatus

@Component
@ConditionalOnProperty(
  prefix = "sefilm.notification.provider.Pushover",
  name = ["enabled"],
  matchIfMissing = true,
  havingValue = "true"
)
class PushoverNotificationProvider(
  private val pushoverService: PushoverService,
  private val providerHelper: ProviderHelper
) : NotificationProvider<PushoverSettings>, ApplicationListener<NotificationEvent> {

  private val log: Logger = LoggerFactory.getLogger(this.javaClass)

  @Async
  override fun onApplicationEvent(event: NotificationEvent) {
    if (pushoverService.isUsable()) {
      sendNotification(event)
    }
  }

  fun sendNotification(event: NotificationEvent) {
    getNotifiableUsers(event.potentialRecipients).forEach { user ->
      if (user.enabledTypes.contains(event.type)) {
        val msg = providerHelper.constructMessageBasedOnEvent(event)

        log.trace("About to send {} to {}", msg, user)
        pushoverService.send(msg, user.notificationSettings.userKey, user.notificationSettings.device)
      }
    }
  }

  override fun getNotifiableUsers(knownRecipients: List<UserID>): List<NotifiableUser<PushoverSettings>> {
    return providerHelper
      .getNotifiableUsers(knownRecipients, PushoverSettings::class)
      .filter { it.notificationSettings.userKeyStatus == PushoverValidationStatus.USER_AND_DEVICE_VALID }
  }

  override val name = "Pushover"
  override val isSubscribable = true
}
