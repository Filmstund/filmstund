package rocks.didit.sefilm.web.controllers

import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.util.UriComponentsBuilder
import rocks.didit.sefilm.Application
import rocks.didit.sefilm.NotFoundException
import rocks.didit.sefilm.database.entities.Location
import rocks.didit.sefilm.database.entities.Showing
import rocks.didit.sefilm.database.repositories.LocationRepository
import rocks.didit.sefilm.database.repositories.ShowingRepository
import rocks.didit.sefilm.domain.Participant
import rocks.didit.sefilm.domain.SEK
import rocks.didit.sefilm.domain.UserID
import rocks.didit.sefilm.domain.dto.*
import rocks.didit.sefilm.domain.dto.ResponseStatusDTO.SuccessfulStatusDTO
import rocks.didit.sefilm.redact
import rocks.didit.sefilm.services.AssertionService
import rocks.didit.sefilm.services.ShowingService
import rocks.didit.sefilm.services.TicketService
import rocks.didit.sefilm.withoutSensitiveFields
import java.time.ZonedDateTime
import java.util.*

@RestController
class ShowingController(
  private val showingService: ShowingService,
  private val repo: ShowingRepository,
  private val locationRepo: LocationRepository,
  private val ticketService: TicketService,
  private val assertionService: AssertionService) {

  companion object {
    private const val PATH = Application.API_BASE_PATH + "/showings"
    private const val PATH_WITH_ID = PATH + "/{id}"
  }

  @GetMapping(PATH, produces = [(MediaType.APPLICATION_JSON_UTF8_VALUE)])
  fun findAll(): List<Showing> {
    val showings = repo.findByPrivateOrderByDateDesc(false)
    val fromThisDate = ZonedDateTime.now().minusDays(7).toLocalDate()
    return showings
      .filter { it.date?.isAfter(fromThisDate) ?: false }
      .map(Showing::withoutSensitiveFields)
  }

  @GetMapping(PATH_WITH_ID, produces = [(MediaType.APPLICATION_JSON_UTF8_VALUE)])
  fun findOne(@PathVariable id: UUID): Showing = repo.findById(id).map(Showing::withoutSensitiveFields).orElseThrow { NotFoundException("showing '$id") }

  private fun findShowing(id: UUID) = repo.findById(id).orElseThrow { NotFoundException("showing '$id'") }

  @PutMapping(PATH_WITH_ID, consumes = [(MediaType.APPLICATION_JSON_UTF8_VALUE)], produces = [(MediaType.APPLICATION_JSON_UTF8_VALUE)])
  fun updateShowing(@PathVariable id: UUID, @RequestBody body: UpdateShowingDTO): Showing {
    val showing = findShowing(id)
    assertionService.assertLoggedInUserIsAdmin(showing)
    assertionService.assertUserHasPhoneNumber(showing.admin)

    val newPayToUser = when {
      body.payToUser != null -> UserID(body.payToUser)
      else -> showing.payToUser
    }
    val newLocation = when {
      body.location != null -> {
        locationRepo.findById(body.location)
          .orElseGet { locationRepo.save(Location(body.location)) }
      }
      else -> showing.location
    }

    val updateShowing = showing.copy(
      price = SEK(body.price),
      private = body.private,
      expectedBuyDate = body.expectedBuyDate,
      payToUser = newPayToUser,
      time = body.time ?: showing.time,
      location = newLocation)

    val updatedShowing = repo.save(updateShowing)
    if (body.ticketsBought) {
      showingService.markAsBought(id)
    }

    if (body.cinemaTicketUrls.isNotEmpty()) {
      ticketService.processTickets(body.cinemaTicketUrls, updatedShowing.id)
    }

    return updatedShowing
  }

  @DeleteMapping(PATH_WITH_ID, produces = [(MediaType.APPLICATION_JSON_UTF8_VALUE)])
  fun deleteShowing(@PathVariable id: UUID): SuccessfulStatusDTO {
    showingService.deleteShowing(id)
    return SuccessfulStatusDTO("Showing with id $id were removed successfully")
  }

  @PostMapping(PATH_WITH_ID + "/invite/googlecalendar", consumes = [(MediaType.APPLICATION_JSON_UTF8_VALUE)], produces = [(MediaType.APPLICATION_JSON_UTF8_VALUE)])
  fun createGoogleCalendarEvent(@PathVariable id: UUID): ResponseStatusDTO {
    val createdEventId = showingService.createCalendarEvent(id).calendarEventId
    return SuccessfulStatusDTO("Event with ID=$createdEventId created")
  }

  @GetMapping(PATH_WITH_ID + "/buy")
  fun getBuyingTicketDetails(@PathVariable id: UUID): PreBuyInfoDTO = showingService.getPreBuyInfo(id)

  @GetMapping(PATH_WITH_ID + "/pay")
  fun getAttendeePaymentInfo(@PathVariable id: UUID): PaymentDTO = showingService.getPaymentInfo(id)

  @PostMapping(PATH, consumes = [(MediaType.APPLICATION_JSON_UTF8_VALUE)], produces = [(MediaType.APPLICATION_JSON_UTF8_VALUE)])
  @ResponseStatus(HttpStatus.CREATED)
  fun createShowing(@RequestBody body: ShowingDTO, b: UriComponentsBuilder): ResponseEntity<Showing> {
    val savedShowing = showingService.createShowing(body)
    val newLocation = b.path(PATH_WITH_ID).buildAndExpand(savedShowing.id).toUri()
    return ResponseEntity.created(newLocation).body(savedShowing)
  }

  @PostMapping(PATH_WITH_ID + "/attend", produces = [(MediaType.APPLICATION_JSON_UTF8_VALUE)])
  fun attend(@PathVariable id: UUID, @RequestBody body: AttendInfoDTO): List<Participant>
    = showingService.attendShowing(id, body.paymentOption)
    .participants
    .map(Participant::redact)

  @PostMapping(PATH_WITH_ID + "/unattend", produces = [(MediaType.APPLICATION_JSON_UTF8_VALUE)])
  fun unattend(@PathVariable id: UUID): List<Participant>
    = showingService.unattendShowing(id)
    .participants
    .map(Participant::redact)
}
