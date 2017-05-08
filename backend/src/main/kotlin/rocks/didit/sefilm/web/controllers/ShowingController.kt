package rocks.didit.sefilm.web.controllers

import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.access.AccessDeniedException
import org.springframework.web.bind.annotation.*
import org.springframework.web.util.UriComponentsBuilder
import rocks.didit.sefilm.*
import rocks.didit.sefilm.database.entities.Location
import rocks.didit.sefilm.database.entities.ParticipantInfo
import rocks.didit.sefilm.database.entities.Showing
import rocks.didit.sefilm.database.entities.User
import rocks.didit.sefilm.database.repositories.*
import rocks.didit.sefilm.domain.Bioklubbnummer
import rocks.didit.sefilm.domain.LimitedUserInfo
import rocks.didit.sefilm.domain.SEK
import rocks.didit.sefilm.domain.UserID
import rocks.didit.sefilm.domain.dto.BuyDTO
import rocks.didit.sefilm.domain.dto.SuccessfulDTO
import rocks.didit.sefilm.domain.dto.UpdateShowingDTO
import java.util.*

@RestController
class ShowingController(private val repo: ShowingRepository,
                        private val locationRepo: LocationRepository,
                        private val movieRepo: MovieRepository,
                        private val userRepo: UserRepository,
                        private val participantRepo: ParticipantInfoRepository) {
    companion object {
        private const val PATH = Application.API_BASE_PATH + "/showings"
        private const val PATH_WITH_ID = PATH + "/{id}"
    }

    private val log = LoggerFactory.getLogger(ShowingController::class.java)

    @GetMapping(PATH, produces = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE))
    fun findAll() = repo.findByPrivate(false)

    @GetMapping(PATH_WITH_ID, produces = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE))
    fun findOne(@PathVariable id: UUID) = repo.findById(id).orElseThrow { NotFoundException("showing '$id") }

    @PutMapping(PATH_WITH_ID, consumes = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE), produces = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE))
    fun updateShowing(@PathVariable id: UUID, @RequestBody body: UpdateShowingDTO): Showing {
        val showing = findOne(id)
        val updateShowing = showing.copy(
                price = SEK(body.price),
                private = body.private,
                ticketsBought = body.ticketsBought)

        return repo.save(updateShowing)
    }

    @DeleteMapping(PATH_WITH_ID, produces = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE))
    fun deleteShowing(@PathVariable id: UUID): SuccessfulDTO {
        // TODO: remove participantsinfo as well
        val showing = findOne(id)
        if (!showing.isLoggedInUserAdmin()) throw AccessDeniedException("Only the admin can delete a showing")
        repo.delete(showing)
        return SuccessfulDTO(true, "Showing with id ${showing.id} were removed successfully")
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
            movie.sfId != null && movie.sfSlug != null -> "https://beta.sfbio.se/film/${movie.sfId}/${movie.sfSlug}"
            else -> null
        }

        var participantsInfo = participantRepo.findByUserIdIn(showing.participants)
        if (participantsInfo.size != showing.participants.size) {
            participantsInfo = createInitialParticipantsInfo(showing)
        }

        return BuyDTO(shuffledBioklubbnummer(showing), sfLink, participantsInfo)
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
    fun attend(@PathVariable id: UUID): Set<UserID> {
        val showing = findOne(id)
        val participantsPlusLoggedInUser = showing.participants.toMutableSet()
        participantsPlusLoggedInUser.add(currentLoggedInUser())

        val savedShowing = repo.save(showing.copy(participants = participantsPlusLoggedInUser))
        return savedShowing.participants
    }

    @PostMapping(PATH_WITH_ID + "/unattend", produces = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE))
    fun unattend(@PathVariable id: UUID): Set<UserID> {
        val showing = findOne(id)
        val participantsWithoutLoggedInUser = showing.participants.toMutableSet()
        participantsWithoutLoggedInUser.remove(currentLoggedInUser())

        val savedShowing = repo.save(showing.copy(participants = participantsWithoutLoggedInUser))
        return savedShowing.participants
    }

    private fun shuffledBioklubbnummer(showing: Showing): Collection<Bioklubbnummer> {
        val ids = showing.participants.toMutableSet()
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
                participants = setOf(admin.id))
    }

    private fun createInitialParticipantsInfo(showing: Showing): Collection<ParticipantInfo> {
        val participants = showing.participants.map {
            ParticipantInfo(userId = it,
                    showingId = showing.id,
                    hasPayed = false,
                    amountOwed = showing.price)
        }

        return participantRepo.saveAll(participants).toList()
    }
}

