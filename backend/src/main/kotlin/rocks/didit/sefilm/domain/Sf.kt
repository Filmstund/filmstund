package rocks.didit.sefilm.domain

import org.springframework.http.HttpEntity
import org.springframework.http.HttpMethod
import org.springframework.stereotype.Component
import org.springframework.web.client.RestTemplate
import java.time.LocalDate
import java.time.LocalDateTime

const val SF_API_URL = "https://beta.sfbio.se/api"


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

data class SfPersonDTO(val displayName: String, val firstName: String, val lastName: String)

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
                              val longDescription: String,
                              val releaseDate: LocalDate,
                              val actors: Collection<SfPersonDTO>,
                              val directors: Collection<SfPersonDTO>,
                              val rating: SfRatingDTO,
                              val length: Long,
                              val posterUrl: String,
                              val slug: String)

data class SfNameValueDTO(val name: String, val value: String)

data class SfDatesAndLocationsDTO(val cinemas: Collection<SfNameValueDTO>,
                                  val dates: Collection<LocalDate>,
                                  val movies: Collection<SfNameValueDTO>)

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

enum class SfTag {
    `3D`,
    VIP,
    TXT,
    EN,
    JA,
    Unknown
}

@Component
class SfClient(private val restTemplate: RestTemplate, private val httpEntity: HttpEntity<Void>) {
    fun getDatesAndLocations(sfId: String) =
            restTemplate.exchange(SF_API_URL + "/v1/shows/quickpickerdata?cityAlias=GB&cinemaIds=&movieIds=$sfId&blockId=1443&imageContentType=webp", HttpMethod.GET, httpEntity, SfDatesAndLocationsDTO::class.java)
                    .body

    /** Date must be in ISO8601 format, i.e 2017-04-11 */
    fun getScreensForDateAndMovie(sfId: String, date: String) =
            restTemplate
                    .exchange(SF_API_URL + "/v1/shows/ShowListing?Cinemas=&Movies=$sfId&Cities=GB&GroupBy=Cinema&ShowListingFilterDate.SelectedDate=$date&BlockId=1443&imageContentType=webp", HttpMethod.GET, httpEntity, SfShowListingEntitiesDTO::class.java)
                    .body
}

