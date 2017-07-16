package rocks.didit.sefilm.clients

import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpMethod
import org.springframework.http.MediaType.APPLICATION_JSON_UTF8
import org.springframework.security.oauth2.common.OAuth2AccessToken
import org.springframework.stereotype.Component
import org.springframework.web.client.RestTemplate
import rocks.didit.sefilm.domain.dto.CalendarEventDTO

@Component
class GoogleCalenderClient(private val restTemplate: RestTemplate, private val httpEntity: HttpEntity<Void>) {
  companion object {
    const val API_URL = "https://www.googleapis.com/calendar/v3/calendars/primary/events"
  }

  @Value("\${google.clientSecret}")
  private val clientSecret: String? = null

  /** @return the event id of the newly created event */
  fun createEvent(event: CalendarEventDTO, accessToken: OAuth2AccessToken): String {
    val headers = HttpHeaders()
    headers.contentType = APPLICATION_JSON_UTF8
    headers.set("authorization", accessToken.tokenType + " " + accessToken.value)

    val entity = HttpEntity(event, headers)

    return restTemplate
      .exchange(API_URL, HttpMethod.POST, entity, Map::class.java, mapOf("sendNotifications" to "true", "key" to clientSecret))
      .body["id"]
      .toString()
  }
}


