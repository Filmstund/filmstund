package rocks.didit.sefilm.notification.providers

import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.context.ApplicationListener
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Component
import rocks.didit.sefilm.events.NotificationEvent
import rocks.didit.sefilm.notification.ProviderHelper
import rocks.didit.sefilm.notification.PushoverNotificationSettings
import rocks.didit.sefilm.services.external.PushoverService
import rocks.didit.sefilm.services.external.UserKeyStatus

@Component
@ConditionalOnProperty(prefix = "sefilm.notification.provider.Pushover", name = ["enabled"], matchIfMissing = true, havingValue = "true")
class PushoverNotificationProvider(
  private val pushoverService: PushoverService,
  private val providerHelper: ProviderHelper) : NotificationProvider, ApplicationListener<NotificationEvent> {

  private val log: Logger = LoggerFactory.getLogger(this.javaClass)

  @Async
  override fun onApplicationEvent(event: NotificationEvent) {
    if (pushoverService.isUsable()) {
      sendNotification(event)
    }
  }

  fun sendNotification(event: NotificationEvent) {
    getUserSettings().forEach {
      val msg = providerHelper.constructMessageBasedOnEvent(event)

      log.trace("About to send {} to {}", msg, it)
      pushoverService.send(msg, it.userKey, it.device)
    }
  }

  override fun getUserSettings(): List<PushoverNotificationSettings> {
    return providerHelper
      .getNotifiable(PushoverNotificationSettings::class)
      .filter { it.userKeyStatus == UserKeyStatus.VALID }
  }

  override val name = "Pushover"
  override val isSubscribable = true
}
