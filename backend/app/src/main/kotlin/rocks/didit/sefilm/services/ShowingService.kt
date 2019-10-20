package rocks.didit.sefilm.services

import org.jdbi.v3.core.Jdbi
import org.jdbi.v3.core.kotlin.inTransactionUnchecked
import org.jdbi.v3.core.kotlin.mapTo
import org.jdbi.v3.sqlobject.kotlin.attach
import org.springframework.security.access.AccessDeniedException
import org.springframework.stereotype.Service
import rocks.didit.sefilm.MissingParametersException
import rocks.didit.sefilm.MissingPhoneNumberException
import rocks.didit.sefilm.NotFoundException
import rocks.didit.sefilm.UnattendedException
import rocks.didit.sefilm.UserAlreadyAttendedException
import rocks.didit.sefilm.currentLoggedInUser
import rocks.didit.sefilm.database.dao.AttendeeDao
import rocks.didit.sefilm.database.dao.ShowingDao
import rocks.didit.sefilm.domain.PaymentOption
import rocks.didit.sefilm.domain.PaymentType
import rocks.didit.sefilm.domain.SEK
import rocks.didit.sefilm.domain.dto.AdminPaymentDetailsDTO
import rocks.didit.sefilm.domain.dto.AttendeePaymentDetailsDTO
import rocks.didit.sefilm.domain.dto.CreateShowingDTO
import rocks.didit.sefilm.domain.dto.FilmstadenScreenDTO
import rocks.didit.sefilm.domain.dto.FilmstadenSeatMapDTO
import rocks.didit.sefilm.domain.dto.GiftCertificateDTO
import rocks.didit.sefilm.domain.dto.PublicUserDTO
import rocks.didit.sefilm.domain.dto.UpdateShowingDTO
import rocks.didit.sefilm.domain.dto.core.AttendeeDTO
import rocks.didit.sefilm.domain.dto.core.CinemaScreenDTO
import rocks.didit.sefilm.domain.dto.core.ShowingDTO
import rocks.didit.sefilm.domain.id.Base64ID
import rocks.didit.sefilm.domain.id.FilmstadenShowingID
import rocks.didit.sefilm.domain.id.MovieID
import rocks.didit.sefilm.domain.id.ShowingID
import rocks.didit.sefilm.domain.id.TicketNumber
import rocks.didit.sefilm.domain.id.UserID
import rocks.didit.sefilm.events.EventPublisher
import rocks.didit.sefilm.logger
import rocks.didit.sefilm.services.external.FilmstadenService
import rocks.didit.sefilm.toDaos
import rocks.didit.sefilm.utils.SwishUtil.Companion.constructSwishUri
import java.time.LocalDate

@Service
class ShowingService(
  private val jdbi: Jdbi,
  private val onDemandShowingDao: ShowingDao,
  private val slugService: SlugService,
  private val filmstadenService: FilmstadenService,
  private val locationService: LocationService,
  private val eventPublisher: EventPublisher,
  private val assertionService: AssertionService
) {
  private val log by logger()

  fun getShowing(id: ShowingID): ShowingDTO? = onDemandShowingDao.findById(id)

  fun getShowing(webId: Base64ID): ShowingDTO? = onDemandShowingDao.findByWebId(webId)

  fun getShowingOrThrow(id: ShowingID): ShowingDTO = getShowing(id)
    ?: throw NotFoundException(what = "showing", showingId = id)

  fun getShowingByMovie(movieId: MovieID): List<ShowingDTO> = onDemandShowingDao
    .findByMovieIdOrderByDateDesc(movieId)

  fun getShowingByUser(userId: UserID): List<ShowingDTO> = onDemandShowingDao.findByAdminOrAttendee(userId)

  fun getShowingsAfterDate(afterDate: LocalDate = LocalDate.MIN): List<ShowingDTO> =
    onDemandShowingDao.findByDateAfterOrderByDateDesc(afterDate)

  /** Info that is needed before you buy the tickets at Filmstaden */
  data class FsIdAndSlug(val filmstadenId: String?, val slug: String?)

  fun getAdminPaymentDetails(showingId: ShowingID): AdminPaymentDetailsDTO? {
    return jdbi.inTransactionUnchecked {
      if (!it.attach<ShowingDao>().isAdminOnShowing(currentLoggedInUser().id, showingId)) {
        log.info(
          "Admin payment details requested by non admin user {} for showing {}",
          currentLoggedInUser().id,
          showingId
        )
        return@inTransactionUnchecked null
      }

      val fsIdAndSlug = it.select(
        "SELECT m.filmstaden_id, m.slug FROM movie m JOIN showing s on s.movie_id = m.id WHERE s.id = ?",
        showingId
      ).mapTo<FsIdAndSlug>().one()

      val filmstadenBuyLink = filmstadenService.getFilmstadenBuyLink(fsIdAndSlug.filmstadenId, fsIdAndSlug.slug)

      val attendees = it.attach<AttendeeDao>().findAllAttendees(showingId)
      AdminPaymentDetailsDTO(showingId, filmstadenBuyLink, attendees)
    }
  }

  /** Info a user needs for paying the one who bought the tickets */
  fun getAttendeePaymentDetails(showingId: ShowingID): AttendeePaymentDetailsDTO? =
    getAttendeePaymentDetailsForUser(currentLoggedInUser().id, showingId)

  fun getAttendeePaymentDetailsForUser(userId: UserID, showingId: ShowingID): AttendeePaymentDetailsDTO? {
    return jdbi.inTransactionUnchecked {
      val showing = getShowingOrThrow(showingId)
      // Only really needed if at least one attendee wants to pay via slack...
      val payeePhone = showing.payToPhone ?: throw MissingPhoneNumberException()

      val attendee = it.attach<AttendeeDao>().findByUserAndShowing(userId, showingId)
        ?: throw NotFoundException("attendee", userId, showingId)

      val swishTo = when {
        attendee.hasPaid -> null
        else -> constructSwishUri(showing, payeePhone)
      }

      AttendeePaymentDetailsDTO(
        attendee.hasPaid,
        showing.price ?: SEK.ZERO,
        showing.payToUser,
        swishTo,
        payeePhone.number,
        userId
      )
    }
  }

  // ToDO: Return a list of PublicAttendeeDTO instead ?
  fun attendShowing(showingId: ShowingID, paymentOption: PaymentOption): ShowingDTO {
    return jdbi.inTransactionUnchecked {
      val daos = it.toDaos()
      val showing = daos.showingDao.findByIdOrThrow(showingId)

      val user = currentLoggedInUser()
      assertionService.assertTicketsNotBought(user.id, showing)
      if (daos.attendeeDao.isAttendeeOnShowing(user.id, showingId)) {
        throw UserAlreadyAttendedException(user.id)
      }

      val attendee = createAttendeeBasedOnPaymentType(paymentOption, user.id, showing)
      daos.attendeeDao.insertAttendeeOnShowing(attendee)

      // TODO: reenable
      //eventPublisher.publish(UserAttendedEvent(this, showing, attendee.user, paymentOption.type))
      showing
    }
  }

  fun unattendShowing(showingId: ShowingID): ShowingDTO {
    return jdbi.inTransactionUnchecked {
      val daos = it.toDaos()
      val showing = daos.showingDao.findByIdOrThrow(showingId)
      val currentUser = currentLoggedInUser()
      assertionService.assertTicketsNotBought(currentUser.id, showing)

      if (!daos.attendeeDao.deleteByUserAndShowing(currentUser.id, showingId)) {
        throw UnattendedException(currentUser.id, showing.id)
      }

      // TODO re-enable
      //eventPublisher.publish(UserUnattendedEvent(this, showing, attendee.user))
      showing
    }
  }

  fun createShowing(data: CreateShowingDTO): ShowingDTO {
    return jdbi.inTransactionUnchecked { handle ->
      val daos = handle.toDaos()
      val userId = currentLoggedInUser().id

      val filmstadenShow = data.filmstadenRemoteEntityId?.let { filmstadenService.fetchFilmstadenShow(it) }
      val showing = data.toShowing(
        userId,
        data.movieId,
        daos.movieDao.findTitleById(data.movieId) ?: throw NotFoundException("movie"),
        filmstadenShow?.screen
      )

      daos.showingDao.insertNewShowing(showing)
      val attendee = createAttendeeBasedOnPaymentType(PaymentOption(PaymentType.Swish), userId, showing)
      daos.attendeeDao.insertAttendeeOnShowing(attendee)

      log.info("{} created new showing {}", userId, showing.id)
      // TODO reenable
      //eventPublisher.publish(NewShowingEvent(this, showing, adminUser))
      showing
    }
  }

  /** Delete the selected showing and return all public showings */
  fun deleteShowing(showingId: ShowingID): List<ShowingDTO> {
    return jdbi.inTransactionUnchecked {
      val dao = it.attach<ShowingDao>()

      val showing = dao.findByIdOrThrow(showingId)
      assertionService.assertLoggedInUserIsAdmin(showing.admin)
      assertionService.assertTicketsNotBought(showing.admin, showing)

      if (!dao.deleteByShowingAndAdmin(showingId, currentLoggedInUser().id)) {
        throw AccessDeniedException("Only the showing admin is allowed to do that")
      }

      log.info("{} deleted showing {} - {} ({})", showing.admin, showing.id, showing.datetime, showing.movieTitle)
      // TODO re-enable
      //eventPublisher.publish(DeletedShowingEvent(this, showing, showing.admin))
      dao.findByDateAfterOrderByDateDesc(LocalDate.MIN)
    }
  }

  fun markAsBought(showingId: ShowingID, price: SEK): ShowingDTO {
    return jdbi.inTransactionUnchecked {
      val dao = it.attach<ShowingDao>()
      val attendeeDao = it.attach<AttendeeDao>()
      val showing = dao.findByIdOrThrow(showingId)

      assertionService.assertLoggedInUserIsAdmin(showing.admin)
      assertionService.assertUserHasPhoneNumber(showing.admin)

      if (showing.ticketsBought) {
        log.info("Showing $showingId is already bought")
        return@inTransactionUnchecked showing
      }

      attendeeDao.markGCAttendeesAsHavingPaid(showingId, currentLoggedInUser().id)
      attendeeDao.updateAmountOwedForSwishAttendees(showingId, currentLoggedInUser().id, price)
      dao.markShowingAsBought(showingId, price)

      // TODO re-enable
      //eventPublisher.publish(TicketsBoughtEvent(this, showing, showing.admin))
      showing.copy(ticketsBought = true, price = price)
    }
  }

  fun updateShowing(showingId: ShowingID, newValues: UpdateShowingDTO): ShowingDTO {
    return jdbi.inTransactionUnchecked { handle ->
      val dao = handle.attach<ShowingDao>()

      val showing = dao.findByIdOrThrow(showingId)
      assertionService.assertLoggedInUserIsAdmin(showing.admin)

      log.info("Updating showing ($showingId) to new values: $newValues")
      val filmstadenShow = newValues.filmstadenRemoteEntityId?.let { filmstadenService.fetchFilmstadenShow(it) }
      val cinemaScreen = CinemaScreenDTO.from(filmstadenShow?.screen)
        ?: showing.cinemaScreen

      if (cinemaScreen != null && cinemaScreen != showing.cinemaScreen) {
        dao.maybeInsertCinemaScreen(cinemaScreen)
      }

      val updatedShowing = showing.copy(
        price = SEK(newValues.price),
        payToUser = newValues.payToUser,
        location = locationService.getOrCreateNewLocation(newValues.location),
        time = newValues.time,
        filmstadenShowingId = FilmstadenShowingID.from(newValues.filmstadenRemoteEntityId),
        cinemaScreen = cinemaScreen,
        date = newValues.date
      )
      dao.updateShowing(updatedShowing, currentLoggedInUser().id)

      // TODO re-enable
      //eventPublisher.publish(UpdatedShowingEvent(this, showing, originalShowing, showing.admin))
      updatedShowing
    }
  }

  fun fetchSeatMap(showingId: ShowingID): List<FilmstadenSeatMapDTO> {
    val showing = getShowingOrThrow(showingId)
    if (showing.location?.filmstadenId == null || showing.cinemaScreen?.id == null) {
      log.debug("Showing $showingId is not at a Filmstaden location or does not have an associated Filmstaden screen")
      return listOf()
    }

    return filmstadenService.getFilmstadenSeatMap(
      showing.location?.filmstadenId!!,
      showing.cinemaScreen?.id!!
    )
  }

  private fun createAttendeeBasedOnPaymentType(
    paymentOption: PaymentOption,
    userId: UserID,
    showing: ShowingDTO
  ): AttendeeDTO =
    when (paymentOption.type) {
      PaymentType.GiftCertificate -> {
        val suppliedTicket = paymentOption.ticketNumber
          ?: throw MissingParametersException("User chose to pay with a gift certificate, but no ticket number were supplied")
        val ticketNumber = TicketNumber(suppliedTicket)

        assertionService.assertGiftCertIsUsable(userId, ticketNumber, showing)
        AttendeeDTO(
          userId = userId,
          showingId = showing.id,
          hasPaid = false,
          type = AttendeeDTO.Type.GIFT_CERTIFICATE,
          giftCertificateUsed = GiftCertificateDTO(userId, ticketNumber),
          amountOwed = SEK.ZERO,
          userInfo = PublicUserDTO(userId)
        )
      }
      PaymentType.Swish -> AttendeeDTO(
        userId = userId,
        showingId = showing.id,
        type = AttendeeDTO.Type.SWISH,
        userInfo = PublicUserDTO(userId)
      )
    }

  /* Fetch location from db or create it if it does not exist before converting the showing */
  private fun CreateShowingDTO.toShowing(
    adminId: UserID,
    movieId: MovieID,
    movieTitle: String,
    cinemaScreen: FilmstadenScreenDTO?
  ): ShowingDTO {
    val location = locationService.getOrCreateNewLocation(this.location)
    val newId = ShowingID.random()
    return ShowingDTO(
      id = newId,
      webId = Base64ID.random(),
      slug = slugService.generateSlugFor(movieTitle),
      date = this.date,
      time = this.time,
      movieId = movieId,
      movieTitle = movieTitle,
      location = location,
      cinemaScreen = CinemaScreenDTO.from(cinemaScreen),
      admin = adminId,
      payToUser = adminId,
      filmstadenShowingId = FilmstadenShowingID.from(this.filmstadenRemoteEntityId)
    )
  }
}