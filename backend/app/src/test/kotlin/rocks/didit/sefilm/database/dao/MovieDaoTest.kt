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
}