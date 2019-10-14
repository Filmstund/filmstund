package rocks.didit.sefilm

import org.jdbi.v3.core.Handle
import org.jdbi.v3.core.Jdbi
import org.jdbi.v3.core.kotlin.useTransactionUnchecked
import org.springframework.stereotype.Component
import rocks.didit.sefilm.database.dao.LocationDao
import rocks.didit.sefilm.database.dao.MovieDao
import rocks.didit.sefilm.database.dao.ParticipantDao
import rocks.didit.sefilm.database.dao.ShowingDao
import rocks.didit.sefilm.database.dao.UserDao
import rocks.didit.sefilm.domain.dto.core.MovieDTO
import rocks.didit.sefilm.domain.dto.core.ParticipantDTO
import rocks.didit.sefilm.domain.dto.core.ShowingDTO
import rocks.didit.sefilm.domain.dto.core.UserDTO
import java.util.*
import java.util.concurrent.ThreadLocalRandom

@Component
class DatabasePrimer(private val jdbi: Jdbi) {
  fun doDbTest(init: DbTest.() -> Unit): DbTest {
    val dbTest = DbTest(jdbi)
    dbTest.init()
    return dbTest
  }
}

class DbTest(private val jdbi: Jdbi) {
  private var testData: TestData = TestData()

  fun withUser(init: TestData.(ThreadLocalRandom) -> UserDTO) {
    testData = testData.addUser(testData.init(ThreadLocalRandom.current()))
  }

  fun withUser(userId: UUID = UUID.randomUUID()) {
    testData = testData.addUser(ThreadLocalRandom.current().nextUserDTO(userId))
  }

  fun withMovie(init: TestData.(ThreadLocalRandom) -> MovieDTO) {
    testData = testData.addMovie(testData.init(ThreadLocalRandom.current()))
  }

  fun withMovie() {
    testData = testData.addMovie(ThreadLocalRandom.current().nextMovie())
  }

  fun withShowing(init: TestData.(ThreadLocalRandom) -> ShowingDTO) {
    testData = testData.addShowing(testData.init(ThreadLocalRandom.current()))
  }

  fun withShowing() {
    if (testData.lastUser == null) {
      withUser()
    }
    if (testData.lastMovie == null) {
      withMovie()
    }
    withShowing { it.nextShowing(testData.lastMovie?.id!!, testData.lastUser?.id!!) }
  }

  fun withParticipant(init: TestData.(ThreadLocalRandom) -> ParticipantDTO) {
    testData = testData.addParticipant(testData.init(ThreadLocalRandom.current()))
  }

  fun withParticipantOnLastShowing() {
    requireNotNull(testData.lastShowing)
    withUser()
    withParticipant {
      it.nextParticipant(testData.lastUser?.id!!, testData.lastShowing?.id!!)
    }
  }

  fun afterInsert(init: TestData.(Handle) -> Unit) {
    insertNotNullFields()
    jdbi.useTransactionUnchecked { handle ->
      testData.init(handle)
    }
  }

  private fun insertNotNullFields() {
    return jdbi.useTransactionUnchecked { handle ->
      val userDao = handle.attach(UserDao::class.java)
      val movieDao = handle.attach(MovieDao::class.java)
      val locationDao = handle.attach(LocationDao::class.java)
      val showingDao = handle.attach(ShowingDao::class.java)
      val participantDao = handle.attach(ParticipantDao::class.java)

      testData.users.forEach {
        userDao.insertUserAndGiftCerts(it.value)
      }
      if (testData.movies.isNotEmpty()) {
        movieDao.insertMovies(testData.movies.values)
      }
      testData.showings.forEach {
        if (it.value.location != null) {
          locationDao.insertLocationAndAlias(it.value.location!!)
        }
        showingDao.insertShowingAndCinemaScreen(it.value)
      }

      if (testData.participants.isNotEmpty()) {
        participantDao.insertParticipantsOnShowing(testData.participants)
      }
    }
  }
}

data class TestData(
  val users: Map<UUID, UserDTO> = mapOf(),
  val lastUser: UserDTO? = null,

  val movies: Map<UUID, MovieDTO> = mapOf(),
  val lastMovie: MovieDTO? = null,

  val showings: Map<UUID, ShowingDTO> = mapOf(),
  val lastShowing: ShowingDTO? = null,

  val participants: List<ParticipantDTO> = listOf(),
  val lastParticipant: ParticipantDTO? = null
) {
  val user: UserDTO get() = lastUser ?: throw IllegalStateException()
  val movie: MovieDTO get() = lastMovie ?: throw IllegalStateException()
  val showing: ShowingDTO get() = lastShowing ?: throw IllegalStateException()
  val participant: ParticipantDTO get() = lastParticipant ?: throw IllegalStateException()

  fun addUser(user: UserDTO): TestData = copy(lastUser = user, users = users.plus(Pair(user.id, user)))
  fun addMovie(movie: MovieDTO): TestData = copy(lastMovie = movie, movies = movies.plus(Pair(movie.id, movie)))
  fun addShowing(showing: ShowingDTO): TestData =
    copy(lastShowing = showing, showings = showings.plus(Pair(showing.id, showing)))

  fun addParticipant(participant: ParticipantDTO): TestData =
    copy(lastParticipant = participant, participants = participants.plus(participant))
}

