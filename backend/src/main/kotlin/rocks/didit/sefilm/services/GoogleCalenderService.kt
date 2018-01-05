package rocks.didit.sefilm.services

import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.core.ParameterizedTypeReference
import org.springframework.http.HttpEntity
import org.springframework.http.HttpMethod
import org.springframework.security.oauth2.client.OAuth2RestTemplate
import org.springframework.stereotype.Component
import org.springframework.web.util.UriComponentsBuilder
import rocks.didit.sefilm.domain.dto.CalendarEventDTO

@Component
class GoogleCalenderService(
  private val restTemplate: OAuth2RestTemplate) {

  companion object {
    private const val API_URL = "https://www.googleapis.com/calendar/v3/calendars/primary/events"
    private val log: Logger = LoggerFactory.getLogger(GoogleCalenderService::class.java)
  }

  /** @return the event id of the newly created event */
  fun createEvent(event: CalendarEventDTO): String {
    val entity = HttpEntity(event)

    val uri = UriComponentsBuilder.fromUriString(API_URL)
      .queryParam("sendNotifications", "true")
      .build().toUri()

    val resultBody: Map<String, Any?>? = restTemplate
      .exchange(uri,
        HttpMethod.POST,
        entity,
        object : ParameterizedTypeReference<Map<String, Any?>>() {})
      .body

    return resultBody?.get("id")?.toString() ?: ""
  }

  fun deleteEvent(eventId: String) {
    try {
      log.info("Removing calendar event with id: $eventId")
      restTemplate.delete("$API_URL/{eventId}", eventId)
    } catch (e: Exception) {
      log.warn("Unable to delete calendar event with ID: $eventId", e)
    }
  }
}


