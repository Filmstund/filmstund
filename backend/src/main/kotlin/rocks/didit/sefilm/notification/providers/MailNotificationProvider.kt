package rocks.didit.sefilm.notification.providers

import org.slf4j.LoggerFactory
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.context.ApplicationListener
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Component
import rocks.didit.sefilm.events.NotificationEvent
import rocks.didit.sefilm.notification.MailSettings
import rocks.didit.sefilm.notification.ProviderHelper

@Component
@ConditionalOnProperty(prefix = "sefilm.notification.provider.MailProvider", name = ["enabled"], matchIfMissing = true, havingValue = "true")
class MailNotificationProvider(private val providerHelper: ProviderHelper) : NotificationProvider<MailSettings>, ApplicationListener<NotificationEvent> {

  private val log = LoggerFactory.getLogger(MailNotificationProvider::class.java)

  override fun getNotifiableUsers(): List<NotifiableUser<MailSettings>>
    = providerHelper.getNotifiableUsers(MailSettings::class)
    .filter { it.notificationSettings.mailAddress != null }

  @Async
  override fun onApplicationEvent(event: NotificationEvent) {
    getNotifiableUsers().forEach { user ->
      if (user.enabledTypes.contains(event.type)) {
        // TODO: actually send mail
        log.debug("(Not-actually) Sending mail notification to ${user.notificationSettings.mailAddress}")
      }
    }
  }

  override val name = "E-Mail"
  override val isSubscribable = true
}
