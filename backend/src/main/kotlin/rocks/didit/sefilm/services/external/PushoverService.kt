package rocks.didit.sefilm.services.external

import com.fasterxml.jackson.annotation.JsonInclude
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.stereotype.Service
import org.springframework.web.client.RestTemplate
import org.springframework.web.client.postForObject
import rocks.didit.sefilm.APIService
import rocks.didit.sefilm.MissingAPIKeyException
import rocks.didit.sefilm.Properties
import rocks.didit.sefilm.events.EventPublisher
import rocks.didit.sefilm.events.PushoverUserKeyInvalidEvent
import rocks.didit.sefilm.notification.ProviderHelper

@Service
@ConditionalOnProperty(
  prefix = "sefilm.notification.provider.Pushover",
  name = ["enabled"],
  matchIfMissing = true,
  havingValue = "true"
)
class PushoverService(
  properties: Properties,
  private val restTemplate: RestTemplate,
  private val eventPublisher: EventPublisher
) {

  private val log: Logger = LoggerFactory.getLogger(this.javaClass)
  private val pushoverSettings: Properties.Pushover = properties.notification.provider.pushover

  fun send(msg: ProviderHelper.NotificationMessage, userKey: String, device: String? = null) {
    log.debug("About to send $msg")

    val payload = payloadWithToken(userKey, device)
      .copy(message = msg.message, title = msg.title, url = msg.url, url_title = msg.urlTitle)

    val response = postToPushover(pushoverSettings.url, payload)
    when {
      response.isTokenInvalid() -> {
        log.warn("Pushover token is invalid, disabling notification provider. Current token: ${pushoverSettings.apiToken}")
        pushoverSettings.enabled = false
        return
      }
      response.isUserKeyInvalid() -> eventPublisher.publish(PushoverUserKeyInvalidEvent(this, payload.user))
      response.status != 1 -> log.warn("Unknown error occurred in Pushover: $response")
      else -> log.debug("Successfully notified {} with Pushover. Request ID: {}", payload.user, response.request)
    }
  }

  fun validateUserKey(userKey: String, device: String?): PushoverValidationStatus {
    val payload = payloadWithToken(userKey, device)
    val response = postToPushover(pushoverSettings.validateUrl, payload)
    log.debug("Got validation response from Pushover: {}", response)

    return when {
      response.isTokenInvalid() -> PushoverValidationStatus.TOKEN_INVALID
      !response.isUserKeyInvalid() && response.isDeviceInvalid() -> PushoverValidationStatus.USER_VALID_DEVICE_INVALID
      !response.isUserKeyInvalid() && !response.isDeviceInvalid() -> PushoverValidationStatus.USER_AND_DEVICE_VALID
      response.isUserKeyInvalid() -> PushoverValidationStatus.USER_INVALID
      else -> PushoverValidationStatus.UNKNOWN
    }
  }

  private fun payloadWithToken(userKey: String, device: String?): PushoverPayload = pushoverSettings.apiToken?.let {
    PushoverPayload(token = it, user = userKey, device = device)
  } ?: throw MissingAPIKeyException(APIService.Pushover)

  private fun postToPushover(url: String, payload: PushoverPayload): PushoverResponse {
    val pushoverResponse = (restTemplate.postForObject<PushoverResponse>(url, payload)
      ?: throw IllegalArgumentException("Got null response when POST:ing to Pushover"))
    log.trace("Pushover response: {}", pushoverResponse)
    return pushoverResponse
  }

  private fun PushoverResponse.isUserKeyInvalid() =
    this.status != 1 && this.user == "invalid"

  private fun PushoverResponse.isDeviceInvalid() =
    this.status != 1 && this.devices.isEmpty()

  private fun PushoverResponse.isTokenInvalid() =
    this.status != 1 && this.token == "invalid"

  fun isUsable() = pushoverSettings.apiToken != null && pushoverSettings.enabled
}

@JsonInclude(JsonInclude.Include.NON_NULL)
private data class PushoverPayload(
  val token: String,
  val user: String,
  val message: String = "<N/A>",
  val title: String? = null,
  val url: String? = null,
  val url_title: String? = null,
  val device: String? = null,
  val priority: Int? = null,
  val timestamp: Long? = null,
  val sound: String? = null
)

private data class PushoverResponse(
  val status: Int,
  val request: String,
  val user: String = "valid",
  val errors: List<String> = listOf(),
  val devices: List<String> = listOf(),
  val device: String? = null,
  val group: Int? = null,
  val token: String = "valid"
)

enum class PushoverValidationStatus {
  USER_AND_DEVICE_VALID,
  USER_VALID_DEVICE_INVALID,
  USER_INVALID,
  TOKEN_INVALID,
  UNKNOWN
}
