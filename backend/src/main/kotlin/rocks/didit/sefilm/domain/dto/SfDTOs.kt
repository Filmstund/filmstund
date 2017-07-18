package rocks.didit.sefilm.domain.dto

import java.time.LocalDate
import java.time.LocalDateTime

data class SfRatingDTO(val age: Int,
                       val ageAccompanied: Int,
                       val alias: String,
                       val displayName: String)

data class SfMovieDTO(val ncgId: String,
                      val title: String,
                      val releaseDate: LocalDate,
                      val rating: SfRatingDTO,
                      val posterUrl: String,
                      val badge: String,
                      val isNew: Boolean,
                      val isUpcoming: Boolean,
                      val slug: String)

data class SfOriginalLanguageDTO(val alias: String,
                                 val englishName: String,
                                 val nativeName: String,
                                 val displayName: String)

data class SfPersonDTO(val displayName: String?, val firstName: String?, val lastName: String?)

data class SfGenreDTO(val name: String)

data class SfExtendedMovieDTO(val ncgId: String,
                              val languageId: String,
                              val originalLanguage: String,
                              val originalLanguages: Collection<SfOriginalLanguageDTO>,
                              val productionYear: Int,
                              val producers: Collection<SfPersonDTO>,
                              val genres: Collection<SfGenreDTO>,
                              val title: String,
                              val originalTitle: String,
                              val shortDescription: String,
                              val longDescription: String?,
                              val releaseDate: LocalDate,
                              val actors: Collection<SfPersonDTO>,
                              val directors: Collection<SfPersonDTO>,
                              val rating: SfRatingDTO,
                              val length: Long,
                              val posterUrl: String,
                              val slug: String)

data class SfAttributeDTO(val alias: String, val displayName: String)

data class SfScreenDTO(val ncgId: String, val screenName: String)

data class SfShowDTO(val attributes: List<SfAttributeDTO>,
                     val cinemaId: String,
                     val cinemaName: String,
                     val cityAlias: String,
                     val cityName: String,
                     val movieId: String,
                     val movieTitle: String,
                     val posterUrl: String,
                     val remoteEntityId: String,
                     val remoteSystemAlias: String,
                     val screen: SfScreenDTO,
                     val time: LocalDateTime)

data class SfShowListingDTO(val id: String, val name: String, val shows: List<SfShowDTO>)

data class SfShowListingEntitiesDTO(val entities: List<SfShowListingDTO>, val totalNumberOfMatchingItems: Int)

data class SfAggregationProperty(val name: String)
data class SfAggregationRequest(val filters: Map<String, Any>,
                                val name: String,
                                val properties: List<SfAggregationProperty>)

data class SfRequestAggregations(val aggregations: List<SfAggregationRequest>)

data class SfResponseAggregations(val aggregations: List<SfAggregationBuckets>)

data class SfAggregationBuckets(val name: String, val buckets: List<SfBucket>)

data class SfBucket(val properties: Map<String, Any>, val count: Long)

enum class SfTag {
  `3D`,
  VIP,
  TXT,
  EN,
  JA,
  SV,
  `Sommar på bio`,
  `Ej textad`,
  Textad,
  Unknown
}


