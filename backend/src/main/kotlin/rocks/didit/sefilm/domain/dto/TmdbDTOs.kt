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

class TmdbMovieDetails(
  val adult: Boolean,
  val backdrop_path: String?,
  val belongs_to_collection: Any?,
  val budget: Int,
  val genres: Array<Any>,
  val homepage: String,
  val id: Int,
  val imdb_id: String,
  val original_language: String,
  val original_title: String,
  val overview: String,
  val popularity: Double,
  val poster_path: String?,
  val production_companies: Array<Any>,
  val production_countries: Array<Any>,
  val release_date: LocalDate,
  val revenue: Int,
  val runtime: Int,
  val spoken_languages: Array<Any>,
  val status: String,
  val tagline: String,
  val title: String,
  val video: Boolean,
  val vote_average: Double,
  val vote_count: Int
)