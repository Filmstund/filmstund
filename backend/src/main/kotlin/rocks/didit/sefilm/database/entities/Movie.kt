package rocks.didit.sefilm.database.entities

import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.LastModifiedDate
import rocks.didit.sefilm.database.ImdbIdConverter
import rocks.didit.sefilm.database.TmdbIdConverter
import rocks.didit.sefilm.domain.IMDbID
import rocks.didit.sefilm.domain.TMDbID
import java.time.Duration
import java.time.Instant
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.*
import javax.persistence.CollectionTable
import javax.persistence.Column
import javax.persistence.Convert
import javax.persistence.ElementCollection
import javax.persistence.Entity
import javax.persistence.Id
import javax.persistence.JoinColumn
import javax.persistence.Table

@Entity
@Table
data class Movie(
  @Id
  val id: UUID = UUID.randomUUID(),

  @Convert(converter = ImdbIdConverter::class)
  var imdbId: IMDbID? = IMDbID.MISSING,

  @Convert(converter = TmdbIdConverter::class)
  var tmdbId: TMDbID? = TMDbID.MISSING,

  var filmstadenId: String? = null,

  var slug: String? = null,
  val title: String = "",
  var synopsis: String? = null,
  var originalTitle: String? = null,
  var releaseDate: LocalDate = LocalDate.now(),
  var productionYear: Int? = null,
  var runtime: Duration = Duration.ZERO,
  var poster: String? = null,

  @ElementCollection
  @CollectionTable(name = "movie_genres", joinColumns = [JoinColumn(name = "movie_id")])
  @Column(name = "genre")
  var genres: MutableSet<String> = mutableSetOf(),

  @LastModifiedDate
  var lastModifiedDate: Instant = Instant.EPOCH,

  @CreatedDate
  val createdDate: Instant = Instant.EPOCH,

  /** How popular the movie is, between 0 and infinity. Updated regularly */
  var popularity: Double = 0.0,
  var popularityLastUpdated: Instant = Instant.EPOCH,
  /** If the movie is archived then it will be excluded from common functions
   *  such as scheduled updates and it won't be visible to end users */
  var archived: Boolean = false
) {

  /** Should we do an extended query to find more information about this movie? */
  fun needsMoreInfo() =
    synopsis == null || poster == null || (durationUntilRelease().toDays() < 14 && runtime == Duration.ZERO)

  fun isPopularityOutdated() = Duration.between(popularityLastUpdated, Instant.now()).toDays() >= 2

  private fun durationUntilRelease(): Duration = Duration.between(LocalDateTime.now(), releaseDate.atTime(0, 0))
}