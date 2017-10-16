package rocks.didit.sefilm.web.services

import org.apache.log4j.Logger
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpMethod
import org.springframework.http.MediaType.APPLICATION_JSON_UTF8
import org.springframework.security.oauth2.common.OAuth2AccessToken
import org.springframework.stereotype.Component
import org.springframework.web.client.RestTemplate
import rocks.didit.sefilm.domain.dto.CalendarEventDTO
import rocks.didit.sefilm.oauthAccessToken

@Component
class GoogleCalenderService(private val restTemplate: RestTemplate) {
  companion object {
    const val API_URL = "https://www.googleapis.com/calendar/v3/calendars/primary/events"
  }

  @Value("\${google.clientSecret}")
  private val clientSecret: String? = null

  val log = Logger.getLogger(GoogleCalenderService::class.java)

  /** @return the event id of the newly created event */
  fun createEvent(event: CalendarEventDTO): String {
    val accessToken = oauthAccessToken()

    val entity = HttpEntity(event, headersWithToken(accessToken))

    val resultBody = restTemplate
      .exchange(API_URL, HttpMethod.POST, entity, Map::class.java, mapOf("sendNotifications" to "true", "key" to clientSecret))

    return resultBody.body?.toString() ?: ""
  }

  fun deleteEvent(eventId: String) {
    val accessToken = oauthAccessToken()
    val headers = headersWithToken(accessToken)
    val entity = HttpEntity<Void>(headers)

    try {
      restTemplate.exchange("https://www.googleapis.com/calendar/v3/calendars/primary/events/{eventId}", HttpMethod.DELETE, entity, Void::class.java, eventId)
    } catch (e: Exception) {
      log.warn("Unable to delete calendar event with ID: $eventId", e)
    }
  }

  private fun headersWithToken(accessToken: OAuth2AccessToken): HttpHeaders {
    val headers = HttpHeaders()
    headers.contentType = APPLICATION_JSON_UTF8
    headers.set("authorization", accessToken.tokenType + " " + accessToken.value)
    return headers
  }
}


