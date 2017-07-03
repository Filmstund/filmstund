package rocks.didit.sefilm.clients

import org.springframework.http.HttpEntity
import org.springframework.security.oauth2.common.OAuth2AccessToken
import org.springframework.stereotype.Component
import org.springframework.util.MultiValueMap
import org.springframework.web.client.RestTemplate
import rocks.didit.sefilm.domain.dto.CalendarEventDTO
import org.springframework.http.MediaType.APPLICATION_FORM_URLENCODED
import org.apache.catalina.manager.StatusTransformer.setContentType
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.http.MediaType.APPLICATION_JSON_UTF8
import rocks.didit.sefilm.ExternalProviderException
import java.text.SimpleDateFormat
import java.time.LocalDateTime
import java.time.ZonedDateTime


@Component
class GoogleCalenderClient(private val restTemplate: RestTemplate, private val httpEntity: HttpEntity<Void>) {
    companion object {
        const val API_URL = "https://www.googleapis.com/calendar/v3/calendars/primary/events"
    }


    @Value("\${google.clientSecret}")
    private val clientSecret: String? = null

    fun createEvent(event: CalendarEventDTO, accessToken: OAuth2AccessToken) {

        val headers = HttpHeaders()
        headers.contentType = APPLICATION_JSON_UTF8

        // TODO Handle case when token needs to be refreshed
        headers.set("authorization",  accessToken.tokenType + " " + accessToken.value)

        val http = HttpEntity(event, headers)
        restTemplate.postForLocation(API_URL, http, mapOf("sendNotifications" to "true", "key" to clientSecret))

    }


}


