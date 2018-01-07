package rocks.didit.sefilm.notification.providers

import com.fasterxml.jackson.annotation.JsonInclude
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.context.ApplicationListener
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Component
import org.springframework.web.client.RestTemplate
import org.springframework.web.client.postForObject
import rocks.didit.sefilm.Properties
import rocks.didit.sefilm.events.EventPublisher
import rocks.didit.sefilm.events.NotificationEvent
import rocks.didit.sefilm.events.PushoverUserKeyInvalidEvent
import rocks.didit.sefilm.logger
import rocks.didit.sefilm.notification.ProviderHelper
import rocks.didit.sefilm.notification.PushoverNotificationSettings

@Component
@ConditionalOnProperty(prefix = "sefilm.notification.provider.Pushover", name = ["enabled"], matchIfMissing = true, havingValue = "true")
class PushoverNotificationProvider(
  properties: Properties,
  private val providerHelper: ProviderHelper,
  private val eventPublisher: EventPublisher,
  private val restTemplate: RestTemplate) : NotificationProvider, ApplicationListener<NotificationEvent> {

  private val pushoverSettings: Properties.Pushover
    = properties.notification.provider.pushover

  companion object {
    private val log by logger()
  }

  @Async
  override fun onApplicationEvent(event: NotificationEvent) {
    if (pushoverSettings.apiToken != null && pushoverSettings.enabled) {
      sendNotification(event)
    }
  }

  fun sendNotification(event: NotificationEvent) {
    getUserSettings().forEach {
      val msg = providerHelper.constructMessageBasedOnEvent(event)
      val payload = PushoverPayload(pushoverSettings.apiToken, it.userKey, msg.message, msg.title, msg.url, msg.urlTitle)

      log.debug("Pushover payload: $payload")
      val response = restTemplate.postForObject<PushoverResponse>(pushoverSettings.url, payload)
      if (response == null) {
        log.warn("Got null response when POST:ing to Pushover")
        return
      }

      when {
        isTokenInvalid(response) -> {
          log.warn("Pushover token is invalid, disabling notification provider. Current token: ${pushoverSettings.apiToken}")
          pushoverSettings.enabled = false
          return
        }
        isUserKeyInvalid(response) -> eventPublisher.publish(PushoverUserKeyInvalidEvent(this, it.userKey!!))
        response.status != 1 -> log.warn("Unknown error occurred in Pushover: $response")
        else -> log.debug("Successfully notified Pushover with request ${response.request}")
      }
    }
  }

  private fun isUserKeyInvalid(response: PushoverResponse) =
    response.status != 1 && response.user == "invalid"

  private fun isTokenInvalid(response: PushoverResponse) =
    response.status != 1 && response.token == "invalid"

  override fun getUserSettings(): List<PushoverNotificationSettings> {
    return providerHelper
      .getNotifiable(PushoverNotificationSettings::class)
      .filter { it.userKey != null }
  }

  override val name = "Pushover"
  override val isSubscribable = true
}

@JsonInclude(JsonInclude.Include.NON_NULL)
private data class PushoverPayload(
  val token: String?,
  val user: String?,
  val message: String,
  val title: String? = null,
  val url: String? = null,
  val url_title: String? = null,
  val device: String? = null,
  val priority: Int? = null,
  val timestamp: Long? = null,
  val sound: String? = null
)

private data class PushoverResponse(val status: Int, val request: String, val user: String = "valid", val errors: List<String> = listOf(), val token: String = "valid")
