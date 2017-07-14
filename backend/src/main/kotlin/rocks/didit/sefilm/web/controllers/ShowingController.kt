package rocks.didit.sefilm.web.controllers

import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.access.AccessDeniedException
import org.springframework.web.bind.annotation.*
import org.springframework.web.util.UriComponentsBuilder
import rocks.didit.sefilm.*
import rocks.didit.sefilm.clients.GoogleCalenderClient
import rocks.didit.sefilm.database.entities.Location
import rocks.didit.sefilm.database.entities.ParticipantInfo
import rocks.didit.sefilm.database.entities.Showing
import rocks.didit.sefilm.database.entities.User
import rocks.didit.sefilm.database.repositories.*
import rocks.didit.sefilm.domain.*
import rocks.didit.sefilm.domain.dto.*
import rocks.didit.sefilm.domain.dto.ResponseStatusDTO.SuccessfulStatusDTO
import java.time.Duration
import java.time.ZoneId
import java.time.ZonedDateTime
import java.util.*
import java.util.stream.Collectors

@RestController
class ShowingController(private val repo: ShowingRepository,
                        private val locationRepo: LocationRepository,
                        private val movieRepo: MovieRepository,
                        private val userRepo: UserRepository,
                        private val participantRepo: ParticipantInfoRepository,
                        private val googleCalenderClient: GoogleCalenderClient) {
  companion object {
    private const val PATH = Application.API_BASE_PATH + "/showings"
    private const val PATH_WITH_ID = PATH + "/{id}"
  }

  private val log = LoggerFactory.getLogger(ShowingController::class.java)

  @GetMapping(PATH, produces = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE))
  fun findAll() = repo.findByPrivate(false).map(Showing::withoutSensitiveFields)

  @GetMapping(PATH_WITH_ID, produces = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE))
  fun findOne(@PathVariable id: UUID) = repo.findById(id).map(Showing::withoutSensitiveFields).orElseThrow { NotFoundException("showing '$id") }

  @PutMapping(PATH_WITH_ID, consumes = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE), produces = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE))
  fun updateShowing(@PathVariable id: UUID, @RequestBody body: UpdateShowingDTO): Showing {
    val showing = findOne(id)
    if (currentLoggedInUser() != showing.admin) {
      throw AccessDeniedException("Only the admin can update a showing")
    }

    val newPayToUser = when {
      body.payToUser != null -> UserID(body.payToUser)
      else -> showing.payToUser
    }
    val newLocation = when {
      body.newLocation != null -> {
        locationRepo.findById(body.newLocation)
          .orElseGet { locationRepo.save(Location(body.newLocation)) }
      }
      else -> showing.location
    }

    val updateShowing = showing.copy(
      price = SEK(body.price),
      private = body.private,
      ticketsBought = body.ticketsBought,
      expectedBuyDate = body.expectedBuyDate,
      payToUser = newPayToUser,
      time = body.newTime ?: showing.time,
      location = newLocation)

    val updatedShowing = repo.save(updateShowing)
    if (body.ticketsBought) {
      createInitialParticipantsInfo(updateShowing)
    }
    return updatedShowing
  }

  @DeleteMapping(PATH_WITH_ID, produces = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE))
  fun deleteShowing(@PathVariable id: UUID): SuccessfulStatusDTO {
    val showing = findOne(id)
    if (!showing.isLoggedInUserAdmin()) throw AccessDeniedException("Only the admin can delete a showing")
    participantRepo.deleteByShowingIdAndUserId(showing.id, currentLoggedInUser())
    repo.delete(showing)
    return SuccessfulStatusDTO("Showing with id ${showing.id} were removed successfully")
  }

  @PostMapping(PATH_WITH_ID + "/invite/googlecalendar", consumes = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE), produces = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE))
  fun createGoogleCalendarEvent(@PathVariable id: UUID, @RequestBody body: List<String>): ResponseStatusDTO {
    val showing = repo.findById(id)
      .map { showing ->
        if (!showing.isLoggedInUserAdmin()) throw AccessDeniedException("Only the admin can create gcal events")
        showing
      }
      .orElseThrow { NotFoundException("showing '$id") }

    val movie = movieRepo.findById(showing.movieId).orElseThrow { NotFoundException("movie '$showing.movieId'") }
    val runtime = movie?.runtime ?: Duration.ofHours(2).plusMinutes(30)
    val event = CalendarEventDTO.of(
      movie.title,
      showing.location,
      showing.participants
        .stream()
        .map { participant ->
          userRepo.findById(participant.userID)
            .map { u -> u.email }
            .orElseThrow { NotFoundException("user '$participant.userID") }

        }
        .collect(Collectors.toList()),
      // Addition of 1 second to prevent too short string format
      ZonedDateTime.of(showing.date, showing.time, ZoneId.systemDefault()).plusSeconds(1),
      ZonedDateTime.of(showing.date, showing.time, ZoneId.systemDefault()).plus(runtime).plusSeconds(1))

    googleCalenderClient.createEvent(event, oauthAccessToken())

    return SuccessfulStatusDTO("Event created")


  }

  @GetMapping(PATH_WITH_ID + "/buy")
  fun findBioklubbnummerForShowing(@PathVariable id: UUID): BuyDTO {
    val showing = repo.findById(id)
      .map { showing ->
        if (!showing.isLoggedInUserAdmin()) throw AccessDeniedException("Only the admin can view buy page")
        showing
      }
      .orElseThrow { NotFoundException("showing '$id") }
    val movie = movieRepo.findById(showing.movieId).orElseThrow { NotFoundException("movie '${showing.movieId}") }

    val sfLink = when {
      movie.sfId != null && movie.sfSlug != null -> "https://www.sf.se/film/${movie.sfId}/${movie.sfSlug}"
      else -> null
    }

    val participantsInfo = participantRepo.findByShowingId(showing.id)
    return BuyDTO(shuffledBioklubbnummer(showing), sfLink, participantsInfo, showing.participants)
  }

  @GetMapping(PATH_WITH_ID + "/pay")
  fun paymentInfo(@PathVariable id: UUID): PaymentDTO {
    val showing = findOne(id)

    val payeePhone = userRepo.findById(showing.payToUser)
      .map { it.phone }
      .orElseThrow { NotFoundException("payment info for showing " + id) }

    val currentUser = currentLoggedInUser()
    val participantInfo = participantRepo
      .findByShowingIdAndUserId(id, currentUser)
      .orElseThrow { PaymentInfoMissing(id) }

    val swishTo = when {
      !participantInfo.hasPaid && participantInfo.amountOwed.ören > 0 && payeePhone != null -> {
        val movieTitle = movieRepo
          .findById(showing.movieId)
          .orElseThrow { NotFoundException("movie with id " + showing.movieId) }
          .title

        SwishDataDTO(
          payee = StringValue(payeePhone.number),
          amount = IntValue(participantInfo.amountOwed.toKronor()),
          message = generateSwishMessage(movieTitle, showing))
          .generateUri()
          .toASCIIString()
      }
      else -> null
    }

    return PaymentDTO(participantInfo.hasPaid, participantInfo.amountOwed, showing.payToUser, swishTo, currentUser)
  }

  @PostMapping(PATH, consumes = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE), produces = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE))
  @ResponseStatus(HttpStatus.CREATED)
  fun saveShowing(@RequestBody body: ShowingDTO, b: UriComponentsBuilder): ResponseEntity<Showing> {
    if (body.date == null || body.location == null || body.movieId == null || body.time == null) throw MissingParametersException()
    if (!movieRepo.existsById(body.movieId)) {
      throw NotFoundException("movie '${body.movieId}'. Can't create showing for movie that does not exist")
    }

    val adminUser = userRepo
      .findById(currentLoggedInUser())
      .map(User::toLimitedUserInfo)
      .orElseThrow { NotFoundException("Current logged in user not found in db") }

    val savedShowing = repo.save(body.toShowing(adminUser))
    val newLocation = b.path(PATH_WITH_ID).buildAndExpand(savedShowing.id).toUri()
    return ResponseEntity.created(newLocation).body(savedShowing)
  }

  @PostMapping(PATH_WITH_ID + "/attend", produces = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE))
  fun attend(@PathVariable id: UUID, @RequestBody body: AttendInfoDTO): Set<Participant> {
    val showing = findOne(id)
    verfiyTicketsNotBought(showing)

    val participantsPlusLoggedInUser = showing.participants.toMutableSet()
    val userId = currentLoggedInUser()

    val participant = PaymentParticipant(userId, body.paymentOption)

    participantsPlusLoggedInUser.removeIf {p -> p.userID == userId }
    participantsPlusLoggedInUser.add(participant)

    val savedShowing = repo.save(showing.copy(participants = participantsPlusLoggedInUser))

    return savedShowing.participants.map(Participant::toLimitedParticipant).toSet()
  }

  @PostMapping(PATH_WITH_ID + "/unattend", produces = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE))
  fun unattend(@PathVariable id: UUID): List<Participant> {
    val showing = findOne(id)
    verfiyTicketsNotBought(showing)

    val participantsWithoutLoggedInUser = showing.participants.toMutableSet()
    participantsWithoutLoggedInUser.removeIf { p -> p.userID == currentLoggedInUser()}

    val savedShowing = repo.save(showing.copy(participants = participantsWithoutLoggedInUser))
    return savedShowing.participants.map(Participant::toLimitedParticipant)
  }

  private fun shuffledBioklubbnummer(showing: Showing): Collection<Bioklubbnummer> {
    val ids = showing.participants.map { p -> p.userID }.toMutableList()
    ids.add(showing.admin)

    val bioklubbnummer = userRepo.findAllById(ids).map(User::bioklubbnummer).filterNotNull()
    Collections.shuffle(bioklubbnummer)
    return bioklubbnummer
  }

  /* Fetch location from db or create it if it does not exist before converting the showing */
  private fun ShowingDTO.toShowing(admin: LimitedUserInfo): Showing {
    val location = locationRepo
      .findById(this.location)
      .orElseGet { locationRepo.save(Location(name = this.location)) }
    return Showing(date = this.date,
      time = this.time,
      movieId = this.movieId,
      location = location,
      admin = admin.id,
      payToUser = admin.id,
      expectedBuyDate = this.expectedBuyDate,
      participants = setOf(PaymentParticipant(admin.id, PaymentOption(PaymentType.Swish))))
  }

  private fun createInitialParticipantsInfo(showing: Showing) {
    val participants = showing.participants.map { participant ->
      participantRepo.findByShowingIdAndUserId(showing.id, participant.userID)
        .map { p ->
          // Use existing info
          ParticipantInfo(
            id = p.id,
            userId = participant.userID,
            showingId = showing.id,
            hasPaid = p.hasPaid,
            amountOwed = p.amountOwed)
        }
        .orElseGet {
          // Create new info
          ParticipantInfo(
                  userId = participant.userID,
                  showingId = showing.id,
                  hasPaid = participant.userID == showing.payToUser,
                  amountOwed = showing.price ?: SEK(0))
        }
    }
    participantRepo.saveAll(participants)
  }

  private fun verfiyTicketsNotBought(showing: Showing) {
    if (showing.ticketsBought) {
      throw TicketsAlreadyBoughtException(showing.id)
    }
  }

  private fun generateSwishMessage(movieTitle: String, showing: Showing): StringValue {
    val timeAndDate = " @ ${showing.date} ${showing.time}"
    val maxSize = Math.min(movieTitle.length, 50 - timeAndDate.length)
    val truncatedMovieTitle = movieTitle.substring(0, maxSize)

    return StringValue("$truncatedMovieTitle$timeAndDate")
  }
}
