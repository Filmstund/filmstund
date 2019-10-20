package se.filmstund

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.web.client.RestTemplate
import org.springframework.context.event.EventListener
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.stereotype.Component
import se.filmstund.domain.id.UserID
import se.filmstund.events.*
import java.net.URI

data class GwenEvent(val companyUserId: String, val eventType: String, val event: Any)

@Component
@ConditionalOnProperty(
  prefix = "sefilm.gwen",
  name = ["enabled"],
  matchIfMissing = true,
  havingValue = "true"
)
class GwenProvider(
  private val restTemplate: RestTemplate,
  private val properties: Properties
) {
  @EventListener
  fun receiveEvent(event: FilmstundEvent) {
    if (event.triggeredBy == null) {
      return
    }

    return when (event) {
      is NewShowingEvent -> sendEventToGwen(event.triggeredBy.id, "NewShowingEvent", event.showing.toGwenShowingDTO())
      is UpdatedShowingEvent -> sendEventToGwen(event.triggeredBy.id, "UpdatedShowingEvent", event.showing.toGwenShowingDTO())
      is DeletedShowingEvent -> sendEventToGwen(event.triggeredBy.id, "DeletedShowingEvent", event.showing.toGwenShowingDTO())
      is TicketsBoughtEvent -> sendEventToGwen(event.triggeredBy.id, "TicketsBoughtEvent", event.showing.toGwenShowingDTO())
      is UserAttendedEvent -> sendEventToGwen(event.triggeredBy.id, "UserAttendedEvent", event.showing.toGwenShowingDTO())
      is UserUnattendedEvent -> sendEventToGwen(event.triggeredBy.id, "UserUnattendedEvent", event.showing.toGwenShowingDTO())
      else -> {} // The rest of the events are not interesting as of now
    }
  }

  fun sendEventToGwen(companyUserId: UserID, eventType: String, event: Any) {
    val headers = HttpHeaders()
    headers.set("Authentication", properties.gwen.secret)
    headers.contentType = MediaType.APPLICATION_JSON
    val body = GwenEvent(companyUserId.toString(), eventType, event)

    val request = HttpEntity(body, headers)
    restTemplate.postForEntity(URI.create("${properties.gwen.apiUrl}/event"), request, Void::class.java)
  }
}