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
  val imdbId: IMDbID? = IMDbID.MISSING,

  @Convert(converter = TmdbIdConverter::class)
  val tmdbId: TMDbID? = TMDbID.MISSING,

  val filmstadenId: String? = null


) {
  override fun equals(other: Any?): Boolean {
    if (this === other) return true
    if (javaClass != other?.javaClass) return false

    other as MovieIds

    if (id != other.id) return false
    if (movie.id != other.movie.id) return false
    if (imdbId != other.imdbId) return false
    if (tmdbId != other.tmdbId) return false
    if (filmstadenId != other.filmstadenId) return false

    return true
  }

  override fun hashCode(): Int {
    var result = id.hashCode()
    result = 31 * result + movie.id.hashCode()
    result = 31 * result + imdbId.hashCode()
    result = 31 * result + tmdbId.hashCode()
    result = 31 * result + (filmstadenId?.hashCode() ?: 0)
    return result
  }

  override fun toString(): String {
    return "MovieIds(id=$id, movieId=${movie.id}, imdbId=$imdbId, tmdbId=$tmdbId, filmstadenId=$filmstadenId)"
  }


}
