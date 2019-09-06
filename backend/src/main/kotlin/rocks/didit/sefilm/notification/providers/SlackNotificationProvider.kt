package rocks.didit.sefilm.notification.providers

import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.context.event.EventListener
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Component
import org.springframework.web.client.RestTemplate
import rocks.didit.sefilm.Properties
import rocks.didit.sefilm.events.NewShowingEvent
import rocks.didit.sefilm.events.ShowingEvent
import rocks.didit.sefilm.events.UpdatedShowingEvent
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
) {

  companion object {
    private val log by logger()
  }

  @Async
  @EventListener
  fun pushOnUpdatedEvent(event: UpdatedShowingEvent) {
    if (event.showing.date == event.originalShowing.date && event.showing.time == event.originalShowing.time) {
      // We only push of date or time has changed.
      return
    }

    val showingUrl = getShowingUrl(event)
    val dateField = SlackField("Datum", event.showing.date.toString())
    val timeField = SlackField("Time", event.showing.time.toString())
    val attachement = createAttachement(
      "${event.showing.admin.nick} har ändrat sin visning",
      showingUrl,
      event,
      listOf(dateField, timeField)
    )

    pushToSlack(SlackPayload(attachments = listOf(attachement)))
  }

  @Async
  @EventListener
  fun pushOnNewEvent(event: NewShowingEvent) {
    val showingUrl = getShowingUrl(event)
    val attachement = createAttachement("${event.showing.admin.nick} har skapat en ny visning!", showingUrl, event)
    pushToSlack(SlackPayload(attachments = listOf(attachement)))
  }

  private fun getShowingUrl(event: ShowingEvent) =
    "${properties.baseUrl.frontend}/showings/${event.showing.webId}/${event.showing.slug}"

  private fun createAttachement(
    pretext: String,
    showingUrl: String,
    event: ShowingEvent,
    fields: List<SlackField> = emptyList()
  ): SlackAttachement {
    return SlackAttachement(
      "Ny visning: <$showingUrl>",
      pretext,
      "grey",
      event.showing.movie.title,
      showingUrl,
      event.showing.movie.synopsis ?: "N/A",
      event.showing.location?.name ?: "Filmstaden",
      null,
      null,
      event.showing.movie.poster,
      event.showing.dateTime.atZone(TimeZone.getTimeZone("Europe/Stockholm").toZoneId()).toEpochSecond(),
      fields
    )
  }

  private fun pushToSlack(slackPayload: SlackPayload) {
    val slackUrl: String = properties.notification.provider.slack.slackHookUrl
    if (slackUrl.isBlank()) {
      log.warn("Missing Slack webhook URL. Set env variable \"slackHookUrl\"")
      return
    }

    val headers = HttpHeaders()
    headers.contentType = MediaType.APPLICATION_JSON


    val request = HttpEntity(objectMapper.writeValueAsString(slackPayload), headers)
    try {
      log.info("Notifying Slack about a new showing: {}", slackPayload.attachments[0].titleLink)
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