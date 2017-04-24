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
import rocks.didit.sefilm.domain.Bioklubbnummer
import rocks.didit.sefilm.domain.LimitedUserInfo
import rocks.didit.sefilm.domain.toLimitedUserInfo
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
    fun findOne(@PathVariable id: UUID) = repo.findOne(id).orElseThrow { NotFoundException("showing '$id") }

    @GetMapping(PATH_WITH_ID + "/bioklubbnummer")
    fun findBioklubbnummerForShowing(@PathVariable id: UUID): Collection<Bioklubbnummer> {
        return repo.findOne(id)
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
        if (!movieRepo.exists(body.movieId)) {
            throw NotFoundException("movie '${body.movieId}'. Can't create showing for movie that does not exist")
        }

        val adminUser = userRepo
                .findOne(currentLoggedInUserId())
                .map(User::toLimitedUserInfo)
                .orElseThrow { NotFoundException("Current logged in user not found in db") }

        val savedShowing = repo.save(body.toShowing(adminUser))
        val newLocation = b.path(PATH_WITH_ID).buildAndExpand(savedShowing.id).toUri()
        return ResponseEntity.created(newLocation).body(savedShowing)
    }

    private fun shuffledBioklubbnummer(showing: Showing): Collection<Bioklubbnummer> {
        val ids = showing.participants.map(LimitedUserInfo::id).filterNotNull().toMutableList()
        if (showing.admin?.id != null) ids.add(showing.admin.id)

        val bioklubbnummer = userRepo.findAll(ids).map(User::bioklubbnummer).filterNotNull()
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
                .findOne(this.location)
                .orElseGet { locationRepo.save(Location(name = this.location)) }
        return Showing(date = this.date,
                time = this.time,
                movieId = this.movieId,
                location = location,
                admin = admin)
    }
}
