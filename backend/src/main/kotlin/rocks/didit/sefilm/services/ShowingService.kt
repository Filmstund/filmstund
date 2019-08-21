package rocks.didit.sefilm.services

import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import rocks.didit.sefilm.*
import rocks.didit.sefilm.database.entities.Movie
import rocks.didit.sefilm.database.entities.ParticipantPaymentInfo
import rocks.didit.sefilm.database.entities.Showing
import rocks.didit.sefilm.database.entities.User
import rocks.didit.sefilm.database.repositories.ParticipantPaymentInfoRepository
import rocks.didit.sefilm.database.repositories.ShowingRepository
import rocks.didit.sefilm.domain.*
import rocks.didit.sefilm.domain.dto.*
import rocks.didit.sefilm.events.*
import rocks.didit.sefilm.services.external.FilmstadenService
import rocks.didit.sefilm.utils.SwishUtil.Companion.constructSwishUri
import java.time.LocalDate
import java.util.*

@Service
class ShowingService(
        private val showingRepo: ShowingRepository,
        private val paymentInfoRepo: ParticipantPaymentInfoRepository,
        private val movieService: MovieService,
        private val userService: UserService,
        private val ticketService: TicketService,
        private val slugService: SlugService,
        private val filmstadenService: FilmstadenService,
        private val locationService: LocationService,
        private val eventPublisher: EventPublisher,
        private val assertionService: AssertionService
) {

    companion object {
        private val log: Logger = LoggerFactory.getLogger(ShowingService::class.java)
    }

    private fun getShowingEntity(id: UUID): Showing =
            showingRepo.findById(id).orElseThrow { NotFoundException("showing", showingId = id) }

    fun getShowing(id: UUID): ShowingDTO? = showingRepo
            .findById(id)
            .map { it.toDto() }
            .orElse(null)

    fun getShowing(webId: Base64ID): ShowingDTO? = showingRepo
            .findByWebId(webId)
            .map { it.toDto() }
            .orElse(null)

    fun getShowingOrThrow(id: UUID): ShowingDTO = getShowing(id)
            ?: throw NotFoundException(what = "showing", showingId = id)

    fun getShowingByMovie(movieId: UUID): List<ShowingDTO> = showingRepo
            .findByMovieIdOrderByDateDesc(movieId)
            .map { it.toDto() }

    fun getShowingByUser(user: UserID): List<ShowingDTO> = showingRepo
            .findAll()
            .filter { it.userIsInvolvedInThisShowing(user) }
            .map { it.toDto() }

    fun getAllPublicShowings(afterDate: LocalDate = LocalDate.MIN): List<ShowingDTO> =
            showingRepo.findByPrivateOrderByDateDesc(false).toList()
                    .filter { it.date?.isAfter(afterDate) ?: false }
                    .map { it.toDto() }

    fun getPrivateShowingsForCurrentUser(afterDate: LocalDate = LocalDate.MIN): List<ShowingDTO> {
        val currentLoggedInUser = currentLoggedInUserId()
        return showingRepo.findByPrivateOrderByDateDesc(true)
                .filter { it.userIsInvolvedInThisShowing(currentLoggedInUser) }
                .map { it.toDto() }
    }

    /** Info that is needed before you buy the tickets at Filmstaden */
    fun getAdminPaymentDetails(showingId: UUID): AdminPaymentDetailsDTO? {
        val showing = getShowingEntity(showingId)
        if (showing.admin.id != currentLoggedInUserId()) {
            return null
        }

        // Note that this list is empty before the showing has been marked as bought
        val paymentInfos = paymentInfoRepo.findByShowingId(showingId)
        val ticketMap = showing.participants.map {
            val user = userService.getCompleteUser(it.userId).orElseThrow { NotFoundException("user", it.userId, showingId) }
            val ftgTicket = (it as? FtgBiljettParticipant)?.ticketNumber
            UserAndFilmstadenData(user.id, user.filmstadenMembershipId, ftgTicket)
        }

        return AdminPaymentDetailsDTO(filmstadenService.getFilmstadenBuyLink(showing.movie.id), ticketMap, paymentInfos)
    }

    /** Info a user needs for paying the one who bought the tickets */
    fun getAttendeePaymentDetails(showingId: UUID): AttendeePaymentDetailsDTO? =
            getAttendeePaymentDetailsForUser(currentLoggedInUserId(), showingId)

    fun getAttendeePaymentDetailsForUser(userID: UserID, showingId: UUID): AttendeePaymentDetailsDTO? {
        val showing = getShowingEntity(showingId)
        val payeePhone = showing.payToUser.phone
                .orElseThrow { MissingPhoneNumberException(showing.payToUser.id) }

        val participantInfo = paymentInfoRepo
                .findByShowingIdAndUserId(showingId, userID)
                .orElse(null) ?: return null

        val movieTitle = movieService.getMovieOrThrow(showing.movie.id).title

        val swishTo = when {
            !participantInfo.hasPaid && participantInfo.amountOwed.ören > 0 -> constructSwishUri(
                    showing,
                    payeePhone,
                    participantInfo,
                    movieTitle
            )
            else -> null
        }

        return AttendeePaymentDetailsDTO(
                participantInfo.hasPaid,
                participantInfo.amountOwed,
                showing.payToUser.id,
                swishTo,
                payeePhone.number,
                userID
        )
    }

    fun attendShowing(showingId: UUID, paymentOption: PaymentOption): ShowingDTO {
        val showing = getShowingEntity(showingId)
        val userId = currentLoggedInUserId()
        assertionService.assertTicketsNotBought(userId, showing)
        assertionService.assertUserNotAlreadyAttended(userId, showing)

        val participant: Participant = createParticipantBasedOnPaymentType(paymentOption, userId, showing)

        val newParticipants = showing.participants.plus(participant)
        return showingRepo
                .save(showing.copy(participants = newParticipants))
                .also {
                    val user = userService.getCompleteUser(userId)
                    eventPublisher.publish(UserAttendedEvent(this, it, user, paymentOption.type))
                }
                .toDto()

    }

    fun unattendShowing(showingId: UUID): ShowingDTO {
        val showing = getShowingEntity(showingId)
        val currentUserId = currentLoggedInUserId()
        assertionService.assertTicketsNotBought(currentUserId, showing)

        val participantLst = showing
                .participants
                .filter { it.userId == currentUserId }

        if (participantLst.isEmpty()) {
            return showing.toDto()
        } else if (participantLst.size > 1) {
            throw IllegalStateException("Participant $currentUserId has participated more than one time on showing $showingId")
        }

        val participant = participantLst.first()
        val participantsWithoutLoggedInUser = showing.participants.minus(participant)
        return showingRepo
                .save(showing.copy(participants = participantsWithoutLoggedInUser))
                .also {
                    val user = userService.getCompleteUser(participant.userId)
                    eventPublisher.publish(UserUnattendedEvent(this, it, user))
                }
                .toDto()
    }

    fun createShowing(data: CreateShowingDTO): ShowingDTO {
        val adminUser = userService.getCompleteUser(currentLoggedInUserId())
        val filmstadenShow = data.filmstadenRemoteEntityId?.let { filmstadenService.fetchFilmstadenShow(it) }
        return showingRepo
                .save(data.toShowing(adminUser,
                        movieService.getMovieOrThrow(data.movieId),
                        filmstadenShow?.screen
                ))
                .also {
                    eventPublisher.publish(NewShowingEvent(this, it, adminUser))
                }
                .toDto()
    }

    /** Delete the selected showing and return all public showings */
    fun deleteShowing(showingId: UUID): List<ShowingDTO> {
        val showing = getShowingEntity(showingId)
        assertionService.assertLoggedInUserIsAdmin(showing.admin.id)
        assertionService.assertTicketsNotBought(showing.admin.id, showing)

        paymentInfoRepo.deleteByShowingIdAndUserId(showing.id, currentLoggedInUserId())
        ticketService.deleteTickets(showing)
        showingRepo.delete(showing)

        eventPublisher.publish(DeletedShowingEvent(this, showing, showing.admin))
        return getAllPublicShowings()
    }

    fun markAsBought(showingId: UUID, price: SEK): ShowingDTO {
        val showing = getShowingEntity(showingId)
        assertionService.assertLoggedInUserIsAdmin(showing.admin.id)
        assertionService.assertUserHasPhoneNumber(showing.admin.id)

        if (showing.ticketsBought) {
            log.info("Showing $showingId is already bought")
            return showing.toDto()
        }

        createInitialPaymentInfo(showing)
        return showingRepo
                .save(showing.copy(ticketsBought = true, price = price))
                .also {
                    eventPublisher.publish(TicketsBoughtEvent(this, it, it.admin))
                }
                .toDto()
    }

    fun updateShowing(showingId: UUID, newValues: UpdateShowingDTO): ShowingDTO {
        val showing = getShowingEntity(showingId)
        assertionService.assertLoggedInUserIsAdmin(showing.admin.id)

        log.info("Updating showing ($showingId) to new values: $newValues")
        val filmstadenShow = newValues.filmstadenRemoteEntityId?.let { filmstadenService.fetchFilmstadenShow(it) }
        return showingRepo.save(
                showing.copy(
                        price = SEK(newValues.price),
                        private = newValues.private,
                        payToUser = userService.getCompleteUser(UserID(newValues.payToUser)),
                        expectedBuyDate = newValues.expectedBuyDate,
                        location = locationService.getOrCreateNewLocation(newValues.location),
                        time = newValues.time,
                        filmstadenRemoteEntityId = newValues.filmstadenRemoteEntityId,
                        filmstadenScreen = filmstadenShow?.screen?.toFilmstadenLiteScreen(),
                        date = newValues.date
                )
        )
                .also {
                    eventPublisher.publish(UpdatedShowingEvent(this, it, it.admin))
                }
                .toDto()
    }

    fun fetchSeatMap(showingId: UUID): List<FilmstadenSeatMapDTO> {
        val showing = getShowingOrThrow(showingId)
        if (showing.location.filmstadenId == null || showing.filmstadenScreen?.filmstadenId == null) {
            log.debug("Showing $showingId is not at a Filmstaden location or does not have an associated Filmstaden screen")
            return listOf()
        }

        return filmstadenService.getFilmstadenSeatMap(showing.location.filmstadenId, showing.filmstadenScreen.filmstadenId)
    }

    private fun createParticipantBasedOnPaymentType(paymentOption: PaymentOption, userId: UserID, showing: Showing): Participant =
            when (paymentOption.type) {
                PaymentType.Foretagsbiljett -> {
                    val suppliedTicket = paymentOption.ticketNumber
                            ?: throw MissingParametersException("User chose to pay with a företagsbiljett, but no ticket number were supplied")
                    val ticketNumber = TicketNumber(suppliedTicket)

                    assertionService.assertForetagsbiljettIsUsable(userId, ticketNumber, showing)
                    FtgBiljettParticipant(userId, ticketNumber)
                }
                PaymentType.Swish -> SwishParticipant(userId)
            }

    private fun Showing.userIsInvolvedInThisShowing(userID: UserID): Boolean {
        return this.isAdmin(userID) || this.isParticipantInShowing(userID)
                || this.payToUser.id == userID
    }

    private fun Showing.isAdmin(userID: UserID): Boolean = this.admin.id == userID

    private fun Showing.isParticipantInShowing(userID: UserID): Boolean = this.participants.any { it.userId == userID }

    /* Fetch location from db or create it if it does not exist before converting the showing */
    private fun CreateShowingDTO.toShowing(admin: User,
                                           movie: Movie,
                                           filmstadenScreen: FilmstadenScreenDTO?): Showing {
        val location = locationService.getOrCreateNewLocation(this.location)
        return Showing(
                webId = Base64ID.random(),
                slug = slugService.generateSlugFor(movie),
                date = this.date,
                time = this.time,
                movie = movieService.getMovieOrThrow(this.movieId),
                location = location,
                filmstadenScreen = filmstadenScreen?.toFilmstadenLiteScreen(),
                admin = admin,
                payToUser = admin,
                expectedBuyDate = this.expectedBuyDate,
                participants = setOf(SwishParticipant(admin.id)),
                filmstadenRemoteEntityId = this.filmstadenRemoteEntityId
        )
    }

    private fun createInitialPaymentInfo(showing: Showing) {
        val participants = showing
                .participants
                .map { it ->
                    val hasPaid = it.userId == showing.payToUser.id || it is FtgBiljettParticipant
                    ParticipantPaymentInfo(
                            userId = it.userId,
                            showingId = showing.id,
                            hasPaid = hasPaid,
                            amountOwed = if (hasPaid || showing.price == null) SEK(0) else showing.price
                    )
                }
        paymentInfoRepo.saveAll(participants)
    }

}