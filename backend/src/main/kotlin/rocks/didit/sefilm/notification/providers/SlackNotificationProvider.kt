package rocks.didit.sefilm.notification.providers

import com.fasterxml.jackson.annotation.JsonProperty
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
import java.util.*

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


    val attachement = SlackAttachement(
      "Ny visning: <$showingUrl>",
      "${event.showing.admin.nick} har skapat en ny visning!",
      "grey",
      event.showing.movie.title,
      showingUrl,
      event.showing.movie.synopsis ?: "N/A",
      event.showing.location?.name ?: "Filmstaden",
      null,
      null,
      event.showing.movie.poster,
      event.showing.dateTime.atZone(TimeZone.getTimeZone("Europe/Stockholm").toZoneId()).toEpochSecond(),
      emptyList()
    )

    val payload = SlackPayload(attachments = listOf(attachement))
    val request = HttpEntity(objectMapper.writeValueAsString(payload), headers)
    try {
      log.info("Notifying Slack about a new showing: {}", showingUrl)
      restTemplate.postForEntity(slackUrl, request, String::class.java)
    } catch (e: Exception) {
      log.warn("Failed to post Slack Webhook", e)
    }
  }
}

data class SlackPayload(
  @JsonProperty("icon_emoji")
  val iconEmoji: String = ":sf:",
  @JsonProperty("username")
  val username: String = "SeFilm",
  @JsonProperty("unfurl_links")
  val unfurlLinks: Boolean = false,
  val attachments: List<SlackAttachement>
)

data class SlackField(
  val title: String,
  val value: String,
  val short: Boolean = false
)

data class SlackAttachement(
  val fallback: String,
  val pretext: String? = null,
  val color: String = "grey",
  val title: String,
  @JsonProperty("title_link")
  val titleLink: String,
  val text: String,
  val footer: String,
  @JsonProperty("footer_icon")
  val footerIcon: String? = null,
  @JsonProperty("image_url")
  val imageUrl: String? = null,
  @JsonProperty("thumb_url")
  val thumbUrl: String? = null,
  @JsonProperty("ts")
  val timestamp: Long,
  val fields: List<SlackField> = emptyList()
)