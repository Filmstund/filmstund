package se.filmstund.services

import org.jdbi.v3.core.Jdbi
import org.jdbi.v3.core.kotlin.inTransactionUnchecked
import org.jdbi.v3.core.kotlin.mapTo
import org.jdbi.v3.sqlobject.kotlin.attach
import org.springframework.security.access.AccessDeniedException
import org.springframework.stereotype.Service
import se.filmstund.MissingParametersException
import se.filmstund.MissingPhoneNumberException
import se.filmstund.NotFoundException
import se.filmstund.UnattendedException
import se.filmstund.UserAlreadyAttendedException
import se.filmstund.currentLoggedInUser
import se.filmstund.database.dao.AttendeeDao
import se.filmstund.database.dao.ShowingDao
import se.filmstund.domain.PaymentOption
import se.filmstund.domain.SEK
import se.filmstund.domain.dto.AdminPaymentDetailsDTO
import se.filmstund.domain.dto.AttendeePaymentDetailsDTO
import se.filmstund.domain.dto.FilmstadenScreenDTO
import se.filmstund.domain.dto.FilmstadenSeatMapDTO
import se.filmstund.domain.dto.core.AttendeeDTO
import se.filmstund.domain.dto.core.CinemaScreenDTO
import se.filmstund.domain.dto.core.GiftCertificateDTO
import se.filmstund.domain.dto.core.PublicUserDTO
import se.filmstund.domain.dto.core.ShowingDTO
import se.filmstund.domain.dto.input.CreateShowingDTO
import se.filmstund.domain.dto.input.UpdateShowingDTO
import se.filmstund.domain.id.Base64ID
import se.filmstund.domain.id.FilmstadenShowingID
import se.filmstund.domain.id.MovieID
import se.filmstund.domain.id.ShowingID
import se.filmstund.domain.id.TicketNumber
import se.filmstund.domain.id.UserID
import se.filmstund.events.DeletedShowingEvent
import se.filmstund.events.EventPublisher
import se.filmstund.events.NewShowingEvent
import se.filmstund.events.TicketsBoughtEvent
import se.filmstund.events.UpdatedShowingEvent
import se.filmstund.events.UserAttendedEvent
import se.filmstund.events.UserUnattendedEvent
import se.filmstund.logger
import se.filmstund.services.external.FilmstadenService
import se.filmstund.toDaos
import se.filmstund.utils.SwishUtil.Companion.constructSwishUri
import java.time.LocalDate

@Service
class ShowingService(
  private val jdbi: Jdbi,
  private val onDemandShowingDao: ShowingDao,
  private val slugService: SlugService,
  private val filmstadenService: FilmstadenService,
  private val locationService: LocationService,
  private val giftCertificateService: GiftCertificateService,
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
        .map { attendee ->
          if (attendee.giftCertificateUsed != null) {
            attendee.copy(
              giftCertificateUsed = attendee.giftCertificateUsed!!.copy(
                status = giftCertificateService.getStatusOfTicket(attendee.giftCertificateUsed!!)
              )
            )
          } else {
            attendee
          }
        }
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
        ?: return@inTransactionUnchecked null

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

      showing.also { s ->
        eventPublisher.publish(UserAttendedEvent(s, attendee, user))
      }
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


      showing.also { s ->
        eventPublisher.publish(UserUnattendedEvent(s, currentUser))
      }
    }
  }

  fun createShowing(data: CreateShowingDTO): ShowingDTO {
    return jdbi.inTransactionUnchecked { handle ->
      val daos = handle.toDaos()
      val user = currentLoggedInUser()

      val filmstadenShow = data.filmstadenRemoteEntityId?.let { filmstadenService.fetchFilmstadenShow(it) }
      val showing = data.toShowing(
        user.id,
        data.movieId,
        daos.movieDao.findTitleById(data.movieId) ?: throw NotFoundException("movie"),
        filmstadenShow?.screen
      )

      daos.showingDao.insertShowingAndCinemaScreen(showing)
      val attendee = createAttendeeBasedOnPaymentType(PaymentOption(AttendeeDTO.Type.SWISH), user.id, showing)
      daos.attendeeDao.insertAttendeeOnShowing(attendee)

      log.info("{} created new showing {}", user.id, showing.id)
      showing.also { s ->
        eventPublisher.publish(NewShowingEvent(s, user))
      }
    }
  }

  /** Delete the selected showing and return all public showings */
  fun deleteShowing(showingId: ShowingID): List<ShowingDTO> {
    return jdbi.inTransactionUnchecked {
      val dao = it.attach<ShowingDao>()

      val showing = dao.findByIdOrThrow(showingId)
      assertionService.assertLoggedInUserIsAdmin(showing.admin)
      assertionService.assertTicketsNotBought(showing.admin, showing)

      val currentUser = currentLoggedInUser()
      if (!dao.deleteByShowingAndAdmin(showingId, currentUser.id)) {
        throw AccessDeniedException("Only the showing admin is allowed to do that")
      }

      log.info("{} deleted showing {} - {} ({})", showing.admin, showing.id, showing.datetime, showing.movieTitle)
      eventPublisher.publish(DeletedShowingEvent(showing, currentUser))
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

      val adminUser = currentLoggedInUser().id
      attendeeDao.markGCAttendeesAsHavingPaid(showingId, adminUser)
      attendeeDao.updateAmountOwedForSwishAttendees(showingId, adminUser, price)
      dao.markShowingAsBought(showingId, adminUser, price)

      showing.copy(ticketsBought = true, price = price).also { s ->
        eventPublisher.publish(TicketsBoughtEvent(s, currentLoggedInUser()))
      }
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
      val currentUser = currentLoggedInUser()
      dao.updateShowing(updatedShowing, currentUser.id)

      updatedShowing.also { s ->
        eventPublisher.publish(UpdatedShowingEvent(s, showing, currentUser))
      }
    }
  }

  fun fetchSeatMap(showingId: ShowingID): List<FilmstadenSeatMapDTO> {
    val showing = getShowingOrThrow(showingId)
    if (showing.location.filmstadenId == null || showing.cinemaScreen?.id == null) {
      log.debug("Showing $showingId is not at a Filmstaden location or does not have an associated Filmstaden screen")
      return listOf()
    }

    return filmstadenService.getFilmstadenSeatMap(
      showing.location.filmstadenId!!,
      showing.cinemaScreen?.id!!
    )
  }

  private fun createAttendeeBasedOnPaymentType(
    paymentOption: PaymentOption,
    userId: UserID,
    showing: ShowingDTO
  ): AttendeeDTO =
    when (paymentOption.type) {
      AttendeeDTO.Type.GIFT_CERTIFICATE -> {
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
      AttendeeDTO.Type.SWISH -> AttendeeDTO(
        userId = userId,
        showingId = showing.id,
        type = AttendeeDTO.Type.SWISH,
        userInfo = PublicUserDTO(userId)
      )
      else -> throw IllegalArgumentException("Unsupported payment type")
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