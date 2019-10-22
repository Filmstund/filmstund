package se.filmstund

import org.jdbi.v3.core.Jdbi
import org.jdbi.v3.core.kotlin.useTransactionUnchecked
import org.jeasy.random.EasyRandom
import org.jeasy.random.EasyRandomParameters
import org.jeasy.random.FieldPredicates
import org.jeasy.random.api.Randomizer
import org.springframework.stereotype.Component
import se.filmstund.domain.dto.FilmstadenSeatDTO
import se.filmstund.domain.dto.FilmstadenTicketDTO
import se.filmstund.domain.dto.core.AttendeeDTO
import se.filmstund.domain.dto.core.MovieDTO
import se.filmstund.domain.dto.core.ShowingDTO
import se.filmstund.domain.dto.core.TicketDTO
import se.filmstund.domain.dto.core.UserDTO
import se.filmstund.domain.id.MovieID
import se.filmstund.domain.id.ShowingID
import se.filmstund.domain.id.UserID
import java.time.LocalDate
import java.util.concurrent.ThreadLocalRandom

@Component
class DatabaseTest(private val jdbi: Jdbi) {
  fun start(init: DbTest.() -> Unit): DbTest {
    val dbTest = DbTest(jdbi)
    dbTest.init()
    return dbTest
  }
}

class DbTest(private val jdbi: Jdbi) {
  private var testData: TestData = TestData()

  fun withUser(generate: TestData.(ThreadLocalRandom) -> UserDTO) {
    testData = testData.addUser(testData.generate(ThreadLocalRandom.current()))
  }

  fun withUsers(count: Int, generate: TestData.(ThreadLocalRandom) -> UserDTO) {
    repeat(count) {
      testData = testData.addUser(testData.generate(ThreadLocalRandom.current()))
    }
  }

  fun withUser(userId: UserID = UserID.random()) {
    testData = testData.addUser(ThreadLocalRandom.current().nextUserDTO(userId))
  }

  fun withAdmin(userId: UserID = UserID.random()) {
    testData = testData.addAdmin(ThreadLocalRandom.current().nextUserDTO(userId))
  }

  fun withMovie(generate: TestData.(ThreadLocalRandom) -> MovieDTO) {
    testData = testData.addMovie(testData.generate(ThreadLocalRandom.current()))
  }

  fun withMovies(generate: TestData.(ThreadLocalRandom) -> Collection<MovieDTO>) {
    testData = testData.addMovies(testData.generate(ThreadLocalRandom.current()))
  }

  fun withMovie() {
    testData = testData.addMovie(ThreadLocalRandom.current().nextMovie())
  }

  fun withShowing(generate: TestData.(ThreadLocalRandom) -> ShowingDTO) {
    testData = testData.addShowing(testData.generate(ThreadLocalRandom.current()))
  }

  fun withShowings(count: Int, generate: TestData.(ThreadLocalRandom) -> ShowingDTO) {
    repeat(count) {
      testData = testData.addShowing(testData.generate(ThreadLocalRandom.current()))
    }
  }

  fun withShowings(generate: TestData.(ThreadLocalRandom) -> List<ShowingDTO>) {
    testData = testData.addShowings(testData.generate(ThreadLocalRandom.current()))
  }

  fun withShowing(adminId: UserID? = null, ticketsBought: Boolean = ThreadLocalRandom.current().nextBoolean()) {
    if (testData.lastUser == null && adminId == null) {
      withUser()
    }
    if (testData.lastMovie == null) {
      withMovie()
    }
    withShowing {
      it.nextShowing(
        testData.lastMovie?.id!!,
        adminId ?: testData.lastUser?.id!!
      ).copy(ticketsBought = ticketsBought)
    }
  }

  fun withAttendee(generate: TestData.(ThreadLocalRandom) -> AttendeeDTO) {
    testData = testData.addAttendee(testData.generate(ThreadLocalRandom.current()))
  }

  fun withAttendeesAndUsers(count: Int, generate: TestData.(ThreadLocalRandom) -> Pair<UserDTO, AttendeeDTO>) {
    repeat(count) {
      val pair = testData.generate(ThreadLocalRandom.current())
      testData = testData.addUser(pair.first)
      testData = testData.addAttendee(pair.second)
    }
  }

  fun withAttendeesOnLastShowing() {
    requireNotNull(testData.lastShowing)
    withUser()
    withAttendee {
      it.nextAttendee(testData.lastUser?.id!!, testData.lastShowing?.id!!)
    }
  }

  fun withAttendeesOnLastShowing(count: Int) {
    repeat(count) {
      withAttendeesOnLastShowing()
    }
  }

  fun withTicket(generate: TestData.(ThreadLocalRandom) -> TicketDTO) {
    testData = testData.addTicket(testData.generate(ThreadLocalRandom.current()))
  }

  fun afterInsert(init: TestData.(Daos) -> Unit) {
    insertNotNullFields()
    jdbi.useTransactionUnchecked { handle ->
      testData.init(handle.toDaos())
    }
  }

  fun withDaos(init: Daos.() -> Unit) {
    jdbi.useTransactionUnchecked { handle ->
      handle.toDaos().init()
    }
  }

  private fun insertNotNullFields() {
    return jdbi.useTransactionUnchecked { handle ->
      val daos = handle.toDaos()

      testData.users.forEach {
        if (!daos.userDao.existsById(it.value.id)) {
          daos.userDao.insertUserAndGiftCerts(it.value)
        }
      }
      if (testData.movies.isNotEmpty()) {
        daos.movieDao.insertMovies(testData.movies.values)
      }
      testData.showings.forEach {
        if (it.value.location != null) {
          daos.locationDao.insertLocationAndAlias(it.value.location!!)
        }
        daos.showingDao.insertShowingAndCinemaScreen(it.value)
      }

      if (testData.attendees.isNotEmpty()) {
        daos.attendeeDao.insertAttendeeOnShowing(testData.attendees)
      }

      if (testData.attendees.isNotEmpty()) {
        daos.ticketDao.insertTickets(testData.tickets)
      }
    }
  }
}

data class TestData(
  val tlrnd: ThreadLocalRandom = ThreadLocalRandom.current(),
  val rnd: EasyRandom = EasyRandom(
    EasyRandomParameters()
      .seed(ThreadLocalRandom.current().nextLong())
      .stringLengthRange(5, 15)
      .dateRange(LocalDate.of(1900, 1, 1), LocalDate.now())
      .randomize(
        FieldPredicates.named("profileId").and(FieldPredicates.ofType(String::class.java)).and(
          FieldPredicates.inClass(FilmstadenTicketDTO::class.java)
        ), Randomizer<String> {
          val r = ThreadLocalRandom.current()
          "${r.nextInt(100, 999)}-${r.nextInt(100, 999)}"
        })
      .randomize(
        FieldPredicates.named("number").and(FieldPredicates.ofType(Int::class.java)).and(
          FieldPredicates.inClass(FilmstadenSeatDTO::class.java)
        ), Randomizer<Int> {
          ThreadLocalRandom.current().nextInt(0, 100)
        })
      .randomize(
        FieldPredicates.named("row").and(FieldPredicates.ofType(Int::class.java)).and(
          FieldPredicates.inClass(FilmstadenSeatDTO::class.java)
        ), Randomizer<Int> {
          ThreadLocalRandom.current().nextInt(0, 100)
        })
  ),
  val users: Map<UserID, UserDTO> = mapOf(),
  val lastUser: UserDTO? = null,
  val lastAdmin: UserDTO? = null,

  val movies: Map<MovieID, MovieDTO> = mapOf(),
  val lastMovie: MovieDTO? = null,

  val showings: Map<ShowingID, ShowingDTO> = mapOf(),
  val lastShowing: ShowingDTO? = null,

  val attendees: List<AttendeeDTO> = listOf(),
  val lastAttendees: AttendeeDTO? = null,

  val tickets: List<TicketDTO> = listOf(),
  val lastTicket: TicketDTO? = null
) {
  val user: UserDTO get() = lastUser ?: throw IllegalStateException("No user has been created. See #withUser()")
  val admin: UserDTO get() = lastAdmin ?: throw IllegalStateException("No admin has been created. See #withAdmin()")
  val movie: MovieDTO get() = lastMovie ?: throw IllegalStateException("No movie has been created. See #withMovie()")
  val showing: ShowingDTO
    get() = lastShowing ?: throw IllegalStateException("No showing has been created. See #withShowing()")
  val attendee: AttendeeDTO
    get() = lastAttendees ?: throw IllegalStateException("No attendee has been created. See #withAttendee()")
  val ticket: TicketDTO
    get() = lastTicket ?: throw IllegalStateException("No ticket has been created. See #withTicket()")

  fun addUser(user: UserDTO): TestData = copy(lastUser = user, users = users.plus(Pair(user.id, user)))
  fun addAdmin(admin: UserDTO): TestData =
    copy(lastUser = admin, lastAdmin = admin, users = users.plus(Pair(admin.id, admin)))

  fun addMovie(movie: MovieDTO): TestData = copy(lastMovie = movie, movies = movies.plus(Pair(movie.id, movie)))
  fun addMovies(movies: Collection<MovieDTO>): TestData = copy(
    lastMovie = movies.last(), movies = this.movies.plus(movies.map { Pair(it.id, it) })
  )

  fun addShowing(showing: ShowingDTO): TestData =
    copy(lastShowing = showing, showings = showings.plus(Pair(showing.id, showing)))

  fun addShowings(showings: List<ShowingDTO>): TestData =
    copy(lastShowing = showings.last(), showings = this.showings.plus(showings.map { Pair(it.id, it) }))

  fun addAttendee(attendee: AttendeeDTO): TestData =
    copy(lastAttendees = attendee, attendees = attendees.plus(attendee))

  fun addTicket(ticket: TicketDTO): TestData = copy(lastTicket = ticket, tickets = tickets.plus(ticket))
}

