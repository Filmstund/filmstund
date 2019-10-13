package rocks.didit.sefilm.domain.dto.core

import rocks.didit.sefilm.domain.IMDbID
import rocks.didit.sefilm.domain.TMDbID
import java.time.Duration
import java.time.Instant
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.*

data class MovieDTO(
  val id: UUID,
  val filmstadenId: String? = null,
  val imdbId: IMDbID? = null,
  val tmdbId: TMDbID? = null,
  val slug: String? = null,
  val title: String,
  val synopsis: String? = null,
  val originalTitle: String? = null,
  val releaseDate: LocalDate = LocalDate.now(),
  val productionYear: Int? = null,
  val runtime: Duration = Duration.ZERO,
  val poster: String? = null,
  val genres: Set<String> = emptySet(),
  val popularity: Double = 0.0,
  val popularityLastUpdated: Instant = Instant.EPOCH,
  /** If the movie is archived then it will be excluded from common functions
   *  such as scheduled updates and it won't be visible to end users */
  val archived: Boolean = false,
  val lastModifiedDate: Instant = Instant.now(),
  val createdDate: Instant = Instant.EPOCH
) {
  /** Should we do an extended query to find more information about this movie? */
  fun needsMoreInfo() =
    synopsis == null || poster == null || (durationUntilRelease().toDays() < 14 && runtime == Duration.ZERO)

  fun isPopularityOutdated() = Duration.between(popularityLastUpdated, Instant.now()).toDays() >= 4

  private fun durationUntilRelease(): Duration = Duration.between(LocalDateTime.now(), releaseDate.atTime(0, 0))
}