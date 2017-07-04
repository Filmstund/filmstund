package rocks.didit.sefilm.domain.dto

import java.time.LocalDate

data class TmdbFindExternalResults(val movie_results: List<TmdbMovieResult>)
//val person_results: List<TmdbPersonResult>,
//val tv_results: List<TmdbTVResult>,
//val tv_episode_results: List<TmdbTvEpisodeResult>,
//val tv_season_results: List<TmbdbTvSeasonEpisodeResult>)

data class TmdbMovieResult(val adult: Boolean,
                           val backdrop_path: String?,
                           val genre_ids: List<Int>,
                           val id: Long,
                           val original_language: String,
                           val original_title: String,
                           val overview: String,
                           val release_date: LocalDate,
                           val poster_path: String?,
                           val popularity: Double,
                           val title: String,
                           val video: Boolean,
                           val vote_average: Double,
                           val vote_count: Long)

data class TmdbMovieDetails(
  val adult: Boolean,
  val belongs_to_collection: Any?,
  val budget: Int,
  val genres: List<TmdbGenre>,
  val homepage: String,
  val id: Int,
  val imdb_id: String,
  val original_language: String,
  val original_title: String,
  val overview: String,
  val popularity: Double,
  val production_companies: List<TmdbProductionCompany>,
  val production_countries: List<TmdbProductionCountry>,
  val release_date: LocalDate,
  val revenue: Int,
  val runtime: Int,
  val spoken_languages: List<TmdbSpokenLanguage>,
  val status: String,
  val tagline: String,
  val title: String,
  val video: Boolean,
  val vote_average: Double,
  val vote_count: Int,
  val poster_path: String?,
  val backdrop_path: String?
) {
  fun fullPosterPath(): String? {
    if (this.poster_path != null) {
      return "https://image.tmdb.org/t/p/w500/$poster_path"
    }
    return null
  }

  fun fullBackdropPath(): String? {
    if (this.backdrop_path != null) {
      return "https://image.tmdb.org/t/p/w750/$backdrop_path"
    }
    return null
  }
}

data class TmdbGenre(val id: Int, val name: String)
data class TmdbProductionCompany(val id: Int, val name: String)
data class TmdbProductionCountry(val iso_3166_1: String, val name: String)
data class TmdbSpokenLanguage(val iso_639_1: String, val name: String)
