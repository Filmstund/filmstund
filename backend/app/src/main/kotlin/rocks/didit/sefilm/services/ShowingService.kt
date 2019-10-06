package rocks.didit.sefilm.services

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import rocks.didit.sefilm.MissingParametersException
import rocks.didit.sefilm.MissingPhoneNumberException
import rocks.didit.sefilm.NotFoundException
import rocks.didit.sefilm.currentLoggedInUser
import rocks.didit.sefilm.database.entities.CinemaScreen
import rocks.didit.sefilm.database.entities.GiftCertId
import rocks.didit.sefilm.database.entities.Movie
import rocks.didit.sefilm.database.entities.Participant
import rocks.didit.sefilm.database.entities.ParticipantId
import rocks.didit.sefilm.database.entities.Showing
import rocks.didit.sefilm.database.entities.User
import rocks.didit.sefilm.database.repositories.GiftCertificateRepository
import rocks.didit.sefilm.database.repositories.MovieRepository
import rocks.didit.sefilm.database.repositories.ParticipantRepository
import rocks.didit.sefilm.database.repositories.ShowingRepository
import rocks.didit.sefilm.database.repositories.UserRepository
import rocks.didit.sefilm.domain.Base64ID
import rocks.didit.sefilm.domain.PaymentOption
import rocks.didit.sefilm.domain.PaymentType
import rocks.didit.sefilm.domain.SEK
import rocks.didit.sefilm.domain.TicketNumber
import rocks.didit.sefilm.domain.dto.AdminPaymentDetailsDTO
import rocks.didit.sefilm.domain.dto.AttendeePaymentDetailsDTO
import rocks.didit.sefilm.domain.dto.CreateShowingDTO
import rocks.didit.sefilm.domain.dto.FilmstadenScreenDTO
import rocks.didit.sefilm.domain.dto.FilmstadenSeatMapDTO
import rocks.didit.sefilm.domain.dto.UpdateShowingDTO
import rocks.didit.sefilm.domain.dto.core.ShowingDTO
import rocks.didit.sefilm.events.DeletedShowingEvent
import rocks.didit.sefilm.events.EventPublisher
import rocks.didit.sefilm.events.NewShowingEvent
import rocks.didit.sefilm.events.TicketsBoughtEvent
import rocks.didit.sefilm.events.UpdatedShowingEvent
import rocks.didit.sefilm.events.UserAttendedEvent
import rocks.didit.sefilm.events.UserUnattendedEvent
import rocks.didit.sefilm.logger
import rocks.didit.sefilm.orElseThrow
import rocks.didit.sefilm.services.external.FilmstadenService
import rocks.didit.sefilm.utils.SwishUtil.Companion.constructSwishUri
import java.time.LocalDate
import java.util.*

@Service
class ShowingService(
  private val showingRepo: ShowingRepository,
  private val participantRepo: ParticipantRepository,
  private val movieService: MovieService,
  private val movieRepo: MovieRepository,
  private val userService: UserService,
  private val userRepo: UserRepository,
  private val ticketService: TicketService,
  private val giftCertRepo: GiftCertificateRepository,
  private val slugService: SlugService,
  private val filmstadenService: FilmstadenService,
  private val locationService: LocationService,
  private val eventPublisher: EventPublisher,
  private val assertionService: AssertionService
) {
  private val log by logger()

  private fun getShowingEntity(id: UUID): Showing =
    showingRepo.findById(id).orElseThrow { NotFoundException("showing", showingId = id) }

  fun getShowing(id: UUID): ShowingDTO? = showingRepo
    .findById(id)
    .map { it.toDTO() }
    .orElse(null)

  fun getShowing(webId: Base64ID): ShowingDTO? = showingRepo
    .findByWebId(webId)
    ?.toDTO()

  fun getShowingOrThrow(id: UUID): ShowingDTO = getShowing(id)
    ?: throw NotFoundException(what = "showing", showingId = id)

  fun getShowingByMovie(movieId: UUID): List<ShowingDTO> = showingRepo
    .findByMovieIdOrderByDateDesc(movieId)
    .map { it.toDTO() }

  fun getShowingByUser(userId: UUID): List<ShowingDTO> = showingRepo
    .findByUserId(userId)
    .map { it.toDTO() }

  fun getAllPublicShowings(afterDate: LocalDate = LocalDate.MIN): List<ShowingDTO> =
    showingRepo.findByDateAfterOrderByDateDesc(afterDate)
      .map { it.toDTO() }

  /** Info that is needed before you buy the tickets at Filmstaden */
  @Transactional
  fun getAdminPaymentDetails(showingId: UUID): AdminPaymentDetailsDTO? {
    val showing = getShowingEntity(showingId)
    if (showing.admin.id != currentLoggedInUser().id) {
      return null
    }

    val participants = showing.participants.map { it.toDTO() }
    val filmstadenBuyLink = filmstadenService.getFilmstadenBuyLink(showing.movie.filmstadenId, showing.movie.slug)
    return AdminPaymentDetailsDTO(showing.id, filmstadenBuyLink, participants)
  }

  /** Info a user needs for paying the one who bought the tickets */
  fun getAttendeePaymentDetails(showingId: UUID): AttendeePaymentDetailsDTO? =
    getAttendeePaymentDetailsForUser(currentLoggedInUser().id, showingId)

  @Transactional
  fun getAttendeePaymentDetailsForUser(userId: UUID, showingId: UUID): AttendeePaymentDetailsDTO? {
    val showing = getShowingEntity(showingId)
    val payeePhone = showing.payToUser.phone // Only really needed if at least one participant wants to pay via slack...
      .orElseThrow { MissingPhoneNumberException(showing.payToUser.id) }
    val participant = showing.participants.find { it.user.id == userId }
      ?: throw NotFoundException("participant", userId, showingId)

    val swishTo = when {
      participant.hasPaid -> null
      else -> constructSwishUri(showing, payeePhone)
    }

    return AttendeePaymentDetailsDTO(
      participant.hasPaid,
      showing.price,
      showing.payToUser.id,
      swishTo,
      payeePhone.number,
      userId
    )
  }

  // ToDO: Return a list of PublicParticipantDTO instead ?
  @Transactional
  fun attendShowing(showingId: UUID, paymentOption: PaymentOption): ShowingDTO {
    val showing = getShowingEntity(showingId)
    val user = currentLoggedInUser()
    assertionService.assertTicketsNotBought(user.id, showing)
    assertionService.assertUserNotAlreadyAttended(user.id, showing)

    val participant = participantRepo.save(createParticipantBasedOnPaymentType(paymentOption, user.id, showing))
    showing.participants.add(participant)

    eventPublisher.publish(UserAttendedEvent(this, showing, participant.user, paymentOption.type))
    return showing.toDTO()
  }

  @Transactional
  fun unattendShowing(showingId: UUID): ShowingDTO {
    val showing = getShowingEntity(showingId)
    val currentUser = currentLoggedInUser()
    assertionService.assertTicketsNotBought(currentUser.id, showing)

    val participant = showing.participants.find { it.user.id == currentUser.id }
      ?: return showing.toDTO()

    // TODO: will this be cascaded?
    showing.participants.remove(participant)

    eventPublisher.publish(UserUnattendedEvent(this, showing, participant.user))
    return showing.toDTO()
  }

  @Transactional
  fun createShowing(data: CreateShowingDTO): ShowingDTO {
    val adminUser = userService.getCompleteUser(currentLoggedInUser().id)
    val filmstadenShow = data.filmstadenRemoteEntityId?.let { filmstadenService.fetchFilmstadenShow(it) }
    val showing = showingRepo.save(
      data.toShowing(
        adminUser,
        movieRepo.getOne(data.movieId),
        filmstadenShow?.screen
      )
    )

    log.info("{} created new showing {}", adminUser.id, showing.id)
    eventPublisher.publish(NewShowingEvent(this, showing, adminUser))
    return showing.toDTO()
  }

  /** Delete the selected showing and return all public showings */
  @Transactional
  fun deleteShowing(showingId: UUID): List<ShowingDTO> {
    val showing = getShowingEntity(showingId)
    assertionService.assertLoggedInUserIsAdmin(showing.admin.id)
    assertionService.assertTicketsNotBought(showing.admin.id, showing)

    ticketService.deleteTickets(showing)
    showingRepo.delete(showing)

    log.info("{} deleted showing {} - {} ({})", showing.admin.id, showing.id, showing.dateTime, showing.movie.title)
    eventPublisher.publish(DeletedShowingEvent(this, showing, showing.admin))
    return getAllPublicShowings()
  }

  @Transactional
  fun markAsBought(showingId: UUID, price: SEK): ShowingDTO {
    val showing = getShowingEntity(showingId)
    assertionService.assertLoggedInUserIsAdmin(showing.admin.id)
    assertionService.assertUserHasPhoneNumber(showing.admin.id)

    if (showing.ticketsBought) {
      log.info("Showing $showingId is already bought")
      return showing.toDTO()
    }

    markGiftCertParticipantsAsHavingPaid(showing)
    showing.price = price
    showing.ticketsBought = true

    eventPublisher.publish(TicketsBoughtEvent(this, showing, showing.admin))
    return showing.toDTO()
  }

  @Transactional
  fun updateShowing(showingId: UUID, newValues: UpdateShowingDTO): ShowingDTO {
    val showing = getShowingEntity(showingId)
    assertionService.assertLoggedInUserIsAdmin(showing.admin.id)

    log.info("Updating showing ($showingId) to new values: $newValues")
    val filmstadenShow = newValues.filmstadenRemoteEntityId?.let { filmstadenService.fetchFilmstadenShow(it) }
    val filmstadenScreen = filmstadenShow?.screen


    val originalShowing = showing.copy()
    showing.price = SEK(newValues.price)
    showing.payToUser = userRepo.getOne(newValues.payToUser)
    showing.location = locationService.getOrCreateNewLocation(newValues.location)
    showing.time = newValues.time
    showing.filmstadenShowingId = newValues.filmstadenRemoteEntityId
    if (showing.cinemaScreen?.id != filmstadenScreen?.ncgId) {
      showing.cinemaScreen = filmstadenScreen.toCinemaScreen()
    }
    showing.date = newValues.date
    showingRepo.save(showing)

    eventPublisher.publish(UpdatedShowingEvent(this, showing, originalShowing, showing.admin))
    return showing.toDTO()
  }

  fun fetchSeatMap(showingId: UUID): List<FilmstadenSeatMapDTO> {
    val showing = getShowingOrThrow(showingId)
    if (showing.location.filmstadenId == null || showing.cinemaScreen?.filmstadenId == null) {
      log.debug("Showing $showingId is not at a Filmstaden location or does not have an associated Filmstaden screen")
      return listOf()
    }

    return filmstadenService.getFilmstadenSeatMap(showing.location.filmstadenId!!, showing.cinemaScreen?.filmstadenId!!)
  }

  private fun createParticipantBasedOnPaymentType(
    paymentOption: PaymentOption,
    userId: UUID,
    showing: Showing
  ): Participant =
    when (paymentOption.type) {
      PaymentType.GiftCertificate -> {
        val suppliedTicket = paymentOption.ticketNumber
          ?: throw MissingParametersException("User chose to pay with a gift certificate, but no ticket number were supplied")
        val ticketNumber = TicketNumber(suppliedTicket)

        assertionService.assertForetagsbiljettIsUsable(userId, ticketNumber, showing)
        val userRef = userRepo.getOne(userId)
        Participant(
          id = ParticipantId(userRef, showing),
          participantType = Participant.Type.GIFT_CERTIFICATE,
          giftCertificateUsed = giftCertRepo.getOne(GiftCertId(userRef, ticketNumber))
        )
      }
      PaymentType.Swish -> Participant(
        ParticipantId(userRepo.getOne(userId), showing),
        participantType = Participant.Type.SWISH
      )
    }

  /* Fetch location from db or create it if it does not exist before converting the showing */
  private fun CreateShowingDTO.toShowing(
    admin: User,
    movie: Movie,
    cinemaScreen: FilmstadenScreenDTO?
  ): Showing {
    val location = locationService.getOrCreateNewLocation(this.location)
    val newId = UUID.randomUUID()
    return Showing(
      id = newId,
      webId = Base64ID.random(),
      slug = slugService.generateSlugFor(movie),
      date = this.date,
      time = this.time,
      movie = movieService.getMovieOrThrow(this.movieId),
      location = location,
      cinemaScreen = cinemaScreen?.toCinemaScreen(),
      admin = admin,
      payToUser = admin,
      participants = mutableSetOf(Participant(ParticipantId(admin, showingRepo.getOne(newId)))),
      filmstadenShowingId = this.filmstadenRemoteEntityId
    )
  }

  private fun markGiftCertParticipantsAsHavingPaid(showing: Showing) {
    showing.participants
      .filter { it.participantType == Participant.Type.GIFT_CERTIFICATE }
      .forEach {
        it.hasPaid = true
      }

    showing.participants
      .filter { it.user.id == showing.payToUser.id }
      .forEach {
        it.hasPaid = true
      }
  }

  fun FilmstadenScreenDTO?.toCinemaScreen() = this?.let { CinemaScreen(it.ncgId, it.title) }

}