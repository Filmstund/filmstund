package rocks.didit.sefilm.domain.dto

import java.time.LocalDate

data class TmdbFindExternalResultsDTO(val movie_results: List<TmdbMovieResultDTO>)
                                   //val person_results: List<TmdbPersonResult>,
                                   //val tv_results: List<TmdbTVResult>,
                                   //val tv_episode_results: List<TmdbTvEpisodeResult>,
                                   //val tv_season_results: List<TmbdbTvSeasonEpisodeResult>)

data class TmdbMovieResultDTO(val adult: Boolean,
                              val backdrop_path: String,
                              val genre_ids: List<Int>,
                              val id: Long,
                              val original_language: String,
                              val original_title: String,
                              val overview: String,
                              val release_date: LocalDate,
                              val poster_path: String,
                              val popularity: Double,
                              val title: String,
                              val video: Boolean,
                              val vote_average: Double,
                              val vote_count: Long)