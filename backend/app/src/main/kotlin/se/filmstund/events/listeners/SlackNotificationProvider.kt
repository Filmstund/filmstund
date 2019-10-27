package se.filmstund.events.listeners

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
import se.filmstund.Properties
import se.filmstund.domain.dto.core.MovieDTO
import se.filmstund.events.NewShowingEvent
import se.filmstund.events.ShowingEvent
import se.filmstund.events.UpdatedShowingEvent
import se.filmstund.logger
import se.filmstund.services.MovieService
import java.util.*

@Component
@ConditionalOnProperty(
  prefix = "filmstund.notification.provider.Slack",
  name = ["enabled"],
  matchIfMissing = true,
  havingValue = "true"
)
class SlackNotificationProvider(
  private val movieService: MovieService,
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
    if (event.showing.date == event.showingBeforeUpdate.date && event.showing.time == event.showingBeforeUpdate.time) {
      // We only push of date or time has changed.
      return
    }

    val showingUrl = getShowingUrl(event)
    val dateField = SlackField("Datum", event.showing.date.toString(), true)
    val timeField = SlackField("Tid", event.showing.time.toString(), true)
    val attachement = createAttachement(
      "<!here> ${event.triggeredBy?.nick} har ändrat sin visning",
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
    val attachement =
      createAttachement("<!here> ${event.triggeredBy?.nick} har skapat en ny visning!", showingUrl, event)
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
    val movie = movieService.getMovieOrThrow(event.showing.movieId)
    return SlackAttachement(
      "Filmstund visning för <${movie.originalTitle ?: movie.title}>",
      pretext,
      movie.ifIMDbSupplied("IMDb"),
      movie.ifIMDbSupplied("https://www.imdb.com/title/${movie.imdbId?.value}"),
      movie.ifIMDbSupplied("https://pbs.twimg.com/profile_images/976507090624589824/0x28al44_400x400.jpg"),
      "grey",
      movie.title,
      showingUrl,
      movie.synopsis ?: "N/A",
      event.showing.location.name,
      null,
      null,
      movie.poster,
      event.showing.datetime.atZone(TimeZone.getTimeZone("Europe/Stockholm").toZoneId()).toEpochSecond(),
      fields
    )
  }

  private fun MovieDTO.ifIMDbSupplied(str: String): String? {
    return when {
      imdbId?.isSupplied() == true -> str
      else -> null
    }
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
      log.info("Notifying Slack about showing: {}", slackPayload.attachments[0].titleLink)
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
  val username: String = "Filmstund",
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
  @JsonProperty("author_name")
  val authorName: String? = null,
  @JsonProperty("author_link")
  val authorLink: String? = null,
  @JsonProperty("author_icon")
  val authorIcon: String? = null,
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