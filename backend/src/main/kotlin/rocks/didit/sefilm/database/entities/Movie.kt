package rocks.didit.sefilm.database.entities

import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.LastModifiedDate
import java.time.Duration
import java.time.Instant
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.*
import javax.persistence.*

@Entity
@Table
data class Movie(
  @Id
  val id: UUID = UUID.randomUUID(),

  @OneToOne(mappedBy = "movie", cascade = [CascadeType.ALL], fetch = FetchType.LAZY, optional = false)
  var movieIds: MovieIds? = null,

  val slug: String? = null,
  val title: String = "",
  val synopsis: String? = null,
  val originalTitle: String? = null,
  val releaseDate: LocalDate = LocalDate.now(),
  val productionYear: Int? = null,
  val runtime: Duration = Duration.ZERO,
  val poster: String? = null,

  @ManyToMany(cascade = [CascadeType.PERSIST, CascadeType.MERGE], fetch = FetchType.LAZY)
  @JoinTable(
    name = "movie_genres",
    joinColumns = [JoinColumn(name = "movie_id")],
    inverseJoinColumns = [JoinColumn(name = "genre_id")]
  )
  var genres: MutableSet<Genre> = mutableSetOf(),

  @LastModifiedDate
  val lastModifiedDate: Instant = Instant.EPOCH,

  @CreatedDate
  val createdDate: Instant = Instant.EPOCH,

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

  private fun durationUntilRelease(): Duration = Duration.between(LocalDateTime.now(), releaseDate.atTime(0, 0))
}