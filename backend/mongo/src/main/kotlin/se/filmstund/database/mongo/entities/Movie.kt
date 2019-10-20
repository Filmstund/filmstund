package se.filmstund.database.mongo.entities

import org.springframework.data.annotation.Id
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.mongodb.core.mapping.Document
import se.filmstund.domain.id.IMDbID
import se.filmstund.domain.id.TMDbID
import java.time.Duration
import java.time.Instant
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.*

@Document
@Deprecated(message = "")
internal data class Movie(
  @Id
  val id: UUID = UUID.randomUUID(),
  val imdbId: IMDbID = IMDbID.MISSING,
  val filmstadenId: String? = null,
  val filmstadenSlug: String? = null,
  val tmdbId: TMDbID = TMDbID.MISSING,
  val title: String = "",
  val synopsis: String? = null,
  val originalTitle: String? = null,
  val releaseDate: LocalDate = LocalDate.now(),
  val productionYear: Int? = null,
  val runtime: Duration = Duration.ZERO,
  val poster: String? = null,
  val genres: Collection<String> = emptyList(),
  @LastModifiedDate
  val lastModifiedDate: Instant = Instant.EPOCH,
  /** How popular the movie is, between 0 and infinity. Updated regularly */
  val popularity: Double = 0.0,
  val popularityLastUpdated: Instant = Instant.EPOCH,
  /** If the movie is archived then it will be excluded from common functions
   *  such as scheduled updates and it won't be visible to end users */
  val archived: Boolean = false
) {

  /** Should we do an extended query to find more information about this movie? */
  fun needsMoreInfo() =
    synopsis == null || poster == null || (durationUntilRelease().toDays() < 14 && runtime == Duration.ZERO)

  fun isPopularityOutdated() = Duration.between(popularityLastUpdated, Instant.now()).toDays() >= 2

  fun durationUntilRelease(): Duration = Duration.between(LocalDateTime.now(), releaseDate.atTime(0, 0))
}