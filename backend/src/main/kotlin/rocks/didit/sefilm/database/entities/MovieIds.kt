package rocks.didit.sefilm.database.entities

import rocks.didit.sefilm.database.ImdbIdConverter
import rocks.didit.sefilm.database.TmdbIdConverter
import rocks.didit.sefilm.domain.IMDbID
import rocks.didit.sefilm.domain.TMDbID
import java.util.*
import javax.persistence.*

@Entity
@Table
data class MovieIds(
  /** this is actually the movie id */
  @Id
  val id: UUID,

  @OneToOne(fetch = FetchType.LAZY)
  @MapsId
  var movie: Movie,

  @Convert(converter = ImdbIdConverter::class)
  val imdbId: IMDbID = IMDbID.MISSING,

  @Convert(converter = TmdbIdConverter::class)
  val tmdbId: TMDbID = TMDbID.MISSING,

  val filmstadenId: String? = null
)
