package rocks.didit.sefilm.events

import org.springframework.context.annotation.Profile
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Component
import rocks.didit.sefilm.logger

@Component
@Profile("dev")
class EventLogger {
  companion object {
    private val log by logger()
  }

  @EventListener
  fun logEvents(event: ITBioEvent) {
    return when (event) {
      is NewShowingEvent -> TODO()
      is UpdatedShowingEvent -> TODO()
      is DeletedShowingEvent -> TODO()
      is TicketsBoughtEvent -> TODO()
      is TicketsAddedEvent -> TODO()
      is UserAttendedEvent -> log.info("User ${event.triggeredBy.nick} attended showing ${event.showing.id} with payment type ${event.paymentType}")
      is UserUnattendedEvent -> log.info("User ${event.triggeredBy.nick} unattended showing ${event.showing.id}")
      is PushoverUserKeyInvalidEvent -> log.info("Got an invalid Pushover user key: ${event.userKey}")
    }
  }
}