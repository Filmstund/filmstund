package se.filmstund.events

import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service

@Service
class EventPublisher(
  private val eventPublisher: ApplicationEventPublisher
) {

  fun publish(event: FilmstundEvent) {
    eventPublisher.publishEvent(event)
  }
}