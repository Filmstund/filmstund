package rocks.didit.sefilm.notification.providers

import org.slf4j.LoggerFactory
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.context.ApplicationListener
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Component
import rocks.didit.sefilm.events.NotificationEvent
import rocks.didit.sefilm.notification.ProviderHelper
import rocks.didit.sefilm.notification.MailNotificationSettings

@Component
@ConditionalOnProperty(prefix = "sefilm.notification.provider.MailProvider", name = ["enabled"], matchIfMissing = true, havingValue = "true")
class MailNotificationProvider(private val providerHelper: ProviderHelper) : NotificationProvider, ApplicationListener<NotificationEvent> {

  private val log = LoggerFactory.getLogger(MailNotificationProvider::class.java)

  override fun getUserSettings(): List<MailNotificationSettings>
    = providerHelper.getNotifiable(MailNotificationSettings::class)
    .filter { it.mailAddress != null }

  @Async
  override fun onApplicationEvent(event: NotificationEvent) {
    getUserSettings().forEach {
      // TODO: actually send mail
      log.debug("(Not-actually) Sending mail notification to ${it.mailAddress}")
    }
  }

  override val name = "E-Mail"
  override val isSubscribable = true
}
