package rocks.didit.sefilm.notification.providers

import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.context.ApplicationListener
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Component
import org.springframework.web.client.RestTemplate
import rocks.didit.sefilm.Properties
import rocks.didit.sefilm.events.NewShowingEvent
import rocks.didit.sefilm.logger

@Component
@ConditionalOnProperty(
  prefix = "sefilm.notification.provider.Slack",
  name = ["enabled"],
  matchIfMissing = true,
  havingValue = "true"
)
class SlackNotificationProvider(
  private val restTemplate: RestTemplate,
  private val objectMapper: ObjectMapper,
  private val properties: Properties
) : ApplicationListener<NewShowingEvent> {

  companion object {
    private val log by logger()
  }

  @Async
  override fun onApplicationEvent(event: NewShowingEvent) {
    val slackUrl: String = properties.notification.provider.slack.slackHookUrl
    if (slackUrl.isBlank()) {
      log.warn("Missing Slack webhook URL. Set env variable \"slackHookUrl\"")
      return
    }

    val headers = HttpHeaders()
    headers.contentType = MediaType.APPLICATION_JSON
    val showingUrl = "${properties.baseUrl.frontend}/showings/${event.showing.webId}/${event.showing.slug}"
    val payload = mapOf(
      "text" to "Ny visning: <$showingUrl>",
      "icon_emoji" to ":sf:",
      "username" to "SeFilm"
    )
    val request = HttpEntity<String>(objectMapper.writeValueAsString(payload), headers)
    try {
      log.info("Notifying Slack about a new showing: {}", showingUrl)
      restTemplate.postForEntity(slackUrl, request, String::class.java)
    } catch (e: Exception) {
      log.warn("Failed to post Slack Webhook", e)
    }
  }
}
