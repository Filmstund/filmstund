package rocks.didit.sefilm.database.dao

import org.assertj.core.api.Assertions.assertThat
import org.jdbi.v3.core.Jdbi
import org.jdbi.v3.core.kotlin.useExtensionUnchecked
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.junit.jupiter.SpringExtension
import rocks.didit.sefilm.TestConfig
import rocks.didit.sefilm.database.DbConfig
import rocks.didit.sefilm.domain.dto.core.MovieDTO
import rocks.didit.sefilm.nextMovie
import java.time.Instant
import java.util.*
import java.util.concurrent.ThreadLocalRandom

@ExtendWith(SpringExtension::class)
@SpringBootTest(classes = [Jdbi::class])
@Import(TestConfig::class, DbConfig::class)
internal class MovieDaoTest {
  @Autowired
  private lateinit var jdbi: Jdbi

  private val rnd: ThreadLocalRandom = ThreadLocalRandom.current()

  @Test
  internal fun `given a new movie, when findById(), then same DTO is returned`() {
    val rndMovie = rnd.nextMovie()

    jdbi.useExtensionUnchecked(MovieDao::class) {
      it.insertMovie(rndMovie)

      val movieFromDb = it.findById(rndMovie.id)
      assertThat(movieFromDb)
        .isNotNull
        .isEqualTo(rndMovie)
    }
  }

  @Test
  internal fun `given a movie, when existsById(), then true is returned`() {
    val rndMovie = rnd.nextMovie()

    jdbi.useExtensionUnchecked(MovieDao::class) {
      it.insertMovie(rndMovie)
      assertThat(it.existsById(rndMovie.id)).isTrue()
    }
  }

  @Test
  internal fun `given no movie, when existsById(), then false is returned`() {
    val rndMovieId = UUID.randomUUID()

    jdbi.useExtensionUnchecked(MovieDao::class) {
      assertThat(it.existsById(rndMovieId)).isFalse()
    }
  }

  @Test
  internal fun `given a movie, when existsByFilmstadenId(), then true is returned`() {
    val rndMovie = rnd.nextMovie()

    jdbi.useExtensionUnchecked(MovieDao::class) {
      it.insertMovie(rndMovie)
      assertThat(rndMovie.filmstadenId).isNotNull()
      assertThat(it.existsByFilmstadenId(rndMovie.filmstadenId!!)).isTrue()
    }
  }

  @Test
  internal fun `given no movie, when existsByFilmstadenId(), then false is returned`() {
    val rndFilmstadenId = "fsid${rnd.nextLong(0, 10000000)}"

    jdbi.useExtensionUnchecked(MovieDao::class) {
      assertThat(it.existsByFilmstadenId(rndFilmstadenId)).isFalse()
    }
  }

  @Test
  internal fun `given at least 5 movies, when findAll(), then at least those movies are returned`() {
    val rndMovies = (0..5).map { rnd.nextMovie() }

    jdbi.useExtensionUnchecked(MovieDao::class) {
      it.insertMovies(rndMovies)

      val moviesFromDb = it.findAll()
      assertThat(moviesFromDb)
        .isNotNull
        .isNotEmpty
        .size()
        .isGreaterThanOrEqualTo(rndMovies.size)
        .returnToIterable()
        .containsAll(rndMovies)
        .isSortedAccordingTo(compareBy(MovieDTO::archived).thenByDescending(MovieDTO::popularity))
    }
  }

  @Test
  internal fun `given at least 5 archived movies and 6 unarchived, when findByArchivedOrderByPopularityDesc(false), then only unarchived movies are returned`() {
    val rndUnarchivedMovies = (0..5).map { rnd.nextMovie().copy(archived = false) }
    val rndArchivedMovies = (0..6).map { rnd.nextMovie().copy(archived = true) }

    jdbi.useExtensionUnchecked(MovieDao::class) {
      it.insertMovies(rndUnarchivedMovies.plus(rndArchivedMovies))

      val moviesFromDb = it.findByArchivedOrderByPopularityDesc(false)
      assertThat(moviesFromDb)
        .isNotNull
        .isNotEmpty
        .size()
        .isGreaterThanOrEqualTo(rndUnarchivedMovies.size)
        .returnToIterable()
        .containsAll(rndUnarchivedMovies)
        .isSortedAccordingTo(compareByDescending(MovieDTO::popularity))
    }
  }

  @Test
  internal fun `given at least 5 archived movies and 6 unarchived, when findByArchivedOrderByPopularityDesc(true), then only archived movies are returned`() {
    val rndUnarchivedMovies = (0..5).map { rnd.nextMovie().copy(archived = false) }
    val rndArchivedMovies = (0..6).map { rnd.nextMovie().copy(archived = true) }

    jdbi.useExtensionUnchecked(MovieDao::class) {
      it.insertMovies(rndUnarchivedMovies.plus(rndArchivedMovies))

      val moviesFromDb = it.findByArchivedOrderByPopularityDesc(true)
      assertThat(moviesFromDb)
        .isNotNull
        .isNotEmpty
        .size()
        .isGreaterThanOrEqualTo(rndArchivedMovies.size)
        .returnToIterable()
        .containsAll(rndArchivedMovies)
        .isSortedAccordingTo(compareByDescending(MovieDTO::popularity))
    }
  }

  @Test
  internal fun `given a movie with newer lastModifiedDate, when updateMovie(), then null returned`() {
    val rndMovie = rnd.nextMovie()

    jdbi.useExtensionUnchecked(MovieDao::class) {
      it.insertMovie(rndMovie)

      val movieFromDb = it.updateMovie(rndMovie.copy(title = "newTitle", lastModifiedDate = Instant.now()))
      assertThat(movieFromDb)
        .isNull()
    }
  }

  @Test
  internal fun `given a movie with same lastModifiedDate, when updateMovie(), then updated movie is returned`() {
    val rndMovie = rnd.nextMovie()

    jdbi.useExtensionUnchecked(MovieDao::class) {
      it.insertMovie(rndMovie)

      val movieFromDb = it.updateMovie(rndMovie.copy(title = "newTitle", genres = rndMovie.genres.plus("genreNEW")))
      assertThat(movieFromDb)
        .isNotNull
        .isEqualToIgnoringGivenFields(rndMovie, "title", "genres", "lastModifiedDate")
      assertThat(movieFromDb?.title)
        .isEqualTo("newTitle")
      assertThat(movieFromDb?.genres)
        .size()
        .isGreaterThan(rndMovie.genres.size)
        .returnToIterable()
        .contains("genreNEW")
      assertThat(movieFromDb?.lastModifiedDate)
        .isAfter(rndMovie.lastModifiedDate)
    }
  }

  @Test
  internal fun `given an unarchived movie, when archiveMovie(), then the movie is archived`() {
    val rndMovie = rnd.nextMovie().copy(archived = false)

    jdbi.useExtensionUnchecked(MovieDao::class) {
      it.insertMovie(rndMovie)

      val movieFromDb = it.archiveMovie(rndMovie)
      assertThat(movieFromDb?.archived)
        .isNotNull()
        .isTrue()
      assertThat(movieFromDb?.lastModifiedDate)
        .isNotNull()
        .isAfter(rndMovie.lastModifiedDate)
    }
  }
}