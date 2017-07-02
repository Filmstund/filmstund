package rocks.didit.sefilm.clients

import org.springframework.http.HttpEntity
import org.springframework.http.HttpMethod
import org.springframework.stereotype.Component
import org.springframework.web.client.RestTemplate
import rocks.didit.sefilm.domain.dto.CalendarEventDTO


@Component
class GoogleCalenderClient(private val restTemplate: RestTemplate, private val httpEntity: HttpEntity<Void>) {
    companion object {
        const val API_URL = "https://www.googleapis.com/calendar/v3/calendars/primary/events"
    }

    fun createEvent(event: CalendarEventDTO) {
        val postObject = mapOf(
                "attendees" to event.emails.map { mail -> mapOf("email" to mail) },
                "start" to event.start,
                "end" to event.end,
                "summary" to event.summary
        )

        restTemplate.postForLocation(API_URL, HttpEntity(postObject),  mapOf("sendNotifications" to true))
    }


}


