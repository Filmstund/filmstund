package rocks.didit.sefilm.database.dao

import org.assertj.core.api.Assertions.assertThat
import org.jdbi.v3.core.Jdbi
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.junit.jupiter.SpringExtension
import rocks.didit.sefilm.DatabaseTest
import rocks.didit.sefilm.TestConfig
import rocks.didit.sefilm.database.DbConfig
import rocks.didit.sefilm.domain.dto.core.MovieDTO
import rocks.didit.sefilm.domain.id.FilmstadenNcgID
import rocks.didit.sefilm.domain.id.MovieID
import rocks.didit.sefilm.nextMovie
import java.time.Instant
import java.util.concurrent.ThreadLocalRandom

@ExtendWith(SpringExtension::class)
@SpringBootTest(classes = [Jdbi::class, DatabaseTest::class])
@Import(TestConfig::class, DbConfig::class)
internal class MovieDaoTest {
  @Autowired
  private lateinit var databaseTest: DatabaseTest

  private val rnd: ThreadLocalRandom = ThreadLocalRandom.current()

  @Test
  internal fun `given a new movie, when findById(), then same DTO is returned`() {
    databaseTest.start {
      withMovie()
      afterInsert {
        val movieFromDb = it.movieDao.findById(movie.id)
        assertThat(movieFromDb)
          .isNotNull
          .isEqualTo(movie)
      }
    }
  }

  @Test
  internal fun `given a movie, when existsById(), then true is returned`() {
    databaseTest.start {
      withMovie()
      afterInsert {
        assertThat(it.movieDao.existsById(movie.id)).isTrue()
      }
    }
  }

  @Test
  internal fun `given no movie, when existsById(), then false is returned`() {
    databaseTest.start {
      withDaos {
        val rndMovieId = MovieID.random()
        assertThat(movieDao.existsById(rndMovieId)).isFalse()
      }
    }
  }

  @Test
  internal fun `given a movie, when existsByFilmstadenId(), then true is returned`() {
    databaseTest.start {
      withMovie()
      afterInsert {
        assertThat(movie.filmstadenId).isNotNull
        assertThat(it.movieDao.existsByFilmstadenId(movie.filmstadenId!!)).isTrue()
      }
    }
  }

  @Test
  internal fun `given no movie, when existsByFilmstadenId(), then false is returned`() {
    databaseTest.start {
      withDaos {
        val rndFilmstadenId = FilmstadenNcgID("fsid${rnd.nextLong(0, 10000000)}")
        assertThat(movieDao.existsByFilmstadenId(rndFilmstadenId)).isFalse()
      }
    }
  }

  @Test
  internal fun `given at least 5 movies, when findAll(), then at least those movies are returned`() {
    databaseTest.start {
      withMovies { rnd -> (0..5).map { rnd.nextMovie() } }
      afterInsert {
        val moviesFromDb = it.movieDao.findAll()
        assertThat(moviesFromDb)
          .isNotNull
          .isNotEmpty
          .size()
          .isGreaterThanOrEqualTo(movies.values.size)
          .returnToIterable()
          .containsAll(movies.values)
          .isSortedAccordingTo(compareBy(MovieDTO::archived).thenByDescending(MovieDTO::popularity))
      }
    }
  }

  @Test
  internal fun `given at least 5 archived movies and 6 unarchived, when findByArchivedOrderByPopularityDesc(false), then only unarchived movies are returned`() {
    val rndUnarchivedMovies = (0..5).map { rnd.nextMovie().copy(archived = false) }
    val rndArchivedMovies = (0..6).map { rnd.nextMovie().copy(archived = true) }

    databaseTest.start {
      withMovies { rndUnarchivedMovies }
      withMovies { rndArchivedMovies }
      afterInsert {
        val moviesFromDb = it.movieDao.findByArchivedOrderByPopularityDesc(false)
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
  }

  @Test
  internal fun `given at least 5 archived movies and 6 unarchived, when findByArchivedOrderByPopularityDesc(true), then only archived movies are returned`() {
    val rndUnarchivedMovies = (0..5).map { rnd.nextMovie().copy(archived = false) }
    val rndArchivedMovies = (0..6).map { rnd.nextMovie().copy(archived = true) }

    databaseTest.start {
      withMovies { rndUnarchivedMovies }
      withMovies { rndArchivedMovies }
      afterInsert {
        val moviesFromDb = it.movieDao.findByArchivedOrderByPopularityDesc(true)
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
  }

  @Test
  internal fun `given a movie with newer lastModifiedDate, when updateMovie(), then null returned`() {
    databaseTest.start {
      withMovie()
      afterInsert {
        val movieFromDb = it.movieDao.updateMovie(movie.copy(title = "newTitle", lastModifiedDate = Instant.now()))
        assertThat(movieFromDb).isNull()
      }
    }
  }

  @Test
  internal fun `given a movie with same lastModifiedDate, when updateMovie(), then updated movie is returned`() {
    databaseTest.start {
      withMovie()
      afterInsert {
        val movieFromDb =
          it.movieDao.updateMovie(movie.copy(title = "newTitle", genres = movie.genres.plus("genreNEW")))
        assertThat(movieFromDb)
          .isNotNull
          .isEqualToIgnoringGivenFields(movie, "title", "genres", "lastModifiedDate")
        assertThat(movieFromDb?.title)
          .isEqualTo("newTitle")
        assertThat(movieFromDb?.genres)
          .size()
          .isGreaterThan(movie.genres.size)
          .returnToIterable()
          .contains("genreNEW")
        assertThat(movieFromDb?.lastModifiedDate)
          .isAfter(movie.lastModifiedDate)
      }
    }
  }

  @Test
  internal fun `given 3 unarchived movies and 2 archived, when archiveMovies(), then all movies are archived`() {
    databaseTest.start {
      withMovie { it.nextMovie().copy(archived = false) }
      withMovie { it.nextMovie().copy(archived = false) }
      withMovie { it.nextMovie().copy(archived = false) }
      withMovie { it.nextMovie().copy(archived = true) }
      withMovie { it.nextMovie().copy(archived = true) }
      afterInsert {
        val unarchived = movies.values.filter { m -> !m.archived }.map(MovieDTO::id)
        val count = it.movieDao.archiveMovies(unarchived)

        assertThat(count).isEqualTo(3)

        movies.keys.forEach { mid ->
          val m = it.movieDao.findById(mid)
          assertThat(m?.archived).isTrue()
        }
      }
    }
  }

  @Test
  internal fun `given a movie without an original title, when findTitleById(), then the title is returned`() {
    databaseTest.start {
      withMovie { it.nextMovie().copy(originalTitle = null) }
      afterInsert {
        val title = it.movieDao.findTitleById(movie.id)
        assertThat(title)
          .isNotNull()
          .isEqualTo(movie.title)
      }
    }
  }

  @Test
  internal fun `given a movie with an original title, when findTitleById(), then the original title is returned`() {
    databaseTest.start {
      withMovie()
      afterInsert {
        val title = it.movieDao.findTitleById(movie.id)
        assertThat(title)
          .isNotNull()
          .isEqualTo(movie.originalTitle)
      }
    }
  }
}