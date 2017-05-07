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
import rocks.didit.sefilm.database.entities.Showing
import rocks.didit.sefilm.database.entities.User
import rocks.didit.sefilm.database.repositories.LocationRepository
import rocks.didit.sefilm.database.repositories.MovieRepository
import rocks.didit.sefilm.database.repositories.ShowingRepository
import rocks.didit.sefilm.database.repositories.UserRepository
import rocks.didit.sefilm.domain.*
import java.time.LocalDate
import java.time.LocalTime
import java.util.*

@RestController
class ShowingController(private val repo: ShowingRepository,
                        private val locationRepo: LocationRepository,
                        private val movieRepo: MovieRepository,
                        private val userRepo: UserRepository) {
    companion object {
        private const val PATH = Application.API_BASE_PATH + "/showings"
        private const val PATH_WITH_ID = PATH + "/{id}"
    }

    private val log = LoggerFactory.getLogger(ShowingController::class.java)

    @GetMapping(PATH, produces = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE))
    fun findAll() = repo.findAll()

    @GetMapping(PATH_WITH_ID, produces = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE))
    fun findOne(@PathVariable id: UUID) = repo.findById(id).orElseThrow { NotFoundException("showing '$id") }

    @DeleteMapping(PATH_WITH_ID, produces = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE))
    fun deleteShowing(@PathVariable id: UUID): SuccessfulDTO {
        val showing = findOne(id)
        if (!showing.isLoggedInUserAdmin()) throw AccessDeniedException("Only the admin can delete a showing")
        repo.delete(showing)
        return SuccessfulDTO(true, "Showing with id ${showing.id} were removed successfully")
    }

    @GetMapping(PATH_WITH_ID + "/bioklubbnummer")
    fun findBioklubbnummerForShowing(@PathVariable id: UUID): Collection<Bioklubbnummer> {
        return repo.findById(id)
                .map { showing ->
                    if (!showing.isLoggedInUserAdmin()) throw AccessDeniedException("Only the admin can view the bioklubbnummer")
                    shuffledBioklubbnummer(showing)
                }
                .orElseThrow { NotFoundException("showing '$id") }
    }

    @PostMapping(PATH, consumes = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE), produces = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE))
    @ResponseStatus(HttpStatus.CREATED)
    fun saveShowing(@RequestBody body: ShowingDTO, b: UriComponentsBuilder): ResponseEntity<Showing> {
        if (body.date == null || body.location == null || body.movieId == null || body.time == null) throw MissingParametersException()
        if (!movieRepo.existsById(body.movieId)) {
            throw NotFoundException("movie '${body.movieId}'. Can't create showing for movie that does not exist")
        }

        val adminUser = userRepo
                .findById(currentLoggedInUser().id)
                .map(User::toLimitedUserInfo)
                .orElseThrow { NotFoundException("Current logged in user not found in db") }

        val savedShowing = repo.save(body.toShowing(adminUser))
        val newLocation = b.path(PATH_WITH_ID).buildAndExpand(savedShowing.id).toUri()
        return ResponseEntity.created(newLocation).body(savedShowing)
    }

    @PostMapping(PATH_WITH_ID + "/attend", produces = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE))
    fun attend(@PathVariable id: UUID): AttendDTO {
        val showing = findOne(id)
        val participantsPlusLoggedInUser = showing.participants.toMutableSet()
        participantsPlusLoggedInUser.add(currentLoggedInUser())

        repo.save(showing.copy(participants = participantsPlusLoggedInUser))
        return AttendDTO(true, id, currentLoggedInUser())
    }

    @PostMapping(PATH_WITH_ID + "/unattend", produces = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE))
    fun unattend(@PathVariable id: UUID): AttendDTO {
        val showing = findOne(id)
        val participantsWithoutLoggedInUser = showing.participants.toMutableSet()
        participantsWithoutLoggedInUser.remove(currentLoggedInUser())

        repo.save(showing.copy(participants = participantsWithoutLoggedInUser))
        return AttendDTO(false, id, currentLoggedInUser())
    }

    private fun shuffledBioklubbnummer(showing: Showing): Collection<Bioklubbnummer> {
        val ids = showing.participants.map { it.id }.toMutableSet()
        ids.add(showing.admin.id)

        val bioklubbnummer = userRepo.findAllById(ids).map(User::bioklubbnummer).filterNotNull()
        Collections.shuffle(bioklubbnummer)
        return bioklubbnummer
    }

    data class ShowingDTO(val date: LocalDate?,
                          val time: LocalTime?,
                          val movieId: UUID?,
                          val location: String?)

    /* Fetch location from db or create it if it does not exist before converting the showing */
    private fun ShowingDTO.toShowing(admin: LimitedUserInfo): Showing {
        val location = locationRepo
                .findById(this.location)
                .orElseGet { locationRepo.save(Location(name = this.location)) }
        return Showing(date = this.date,
                time = this.time,
                movieId = this.movieId,
                location = location,
                admin = admin.id)
    }
}

