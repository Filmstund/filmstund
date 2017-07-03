package rocks.didit.sefilm.clients

import org.springframework.core.ParameterizedTypeReference
import org.springframework.http.HttpEntity
import org.springframework.http.HttpMethod
import org.springframework.stereotype.Component
import org.springframework.web.client.RestTemplate
import rocks.didit.sefilm.domain.dto.SfDatesAndLocationsDTO
import rocks.didit.sefilm.domain.dto.SfExtendedMovieDTO
import rocks.didit.sefilm.domain.dto.SfMovieDTO
import rocks.didit.sefilm.domain.dto.SfShowListingEntitiesDTO

@Component
class SfClient(private val restTemplate: RestTemplate, private val httpEntity: HttpEntity<Void>) {
  companion object {
    const val API_URL = "https://www.sf.se/api"
  }

  fun getDatesAndLocations(sfId: String) =
    restTemplate.exchange(API_URL + "/v1/shows/quickpickerdata?cityAlias=GB&cinemaIds=&movieIds=$sfId&blockId=1443&imageContentType=webp", HttpMethod.GET, httpEntity, SfDatesAndLocationsDTO::class.java)
      .body

  /** Date must be in ISO8601 format, i.e 2017-04-11 */
  fun getScreensForDateAndMovie(sfId: String, date: String) =
    restTemplate
      .exchange(API_URL + "/v1/shows/ShowListing?Cinemas=&Movies=$sfId&Cities=GB&GroupBy=Cinema&ShowListingFilterDate.SelectedDate=$date&BlockId=1443&imageContentType=webp", HttpMethod.GET, httpEntity, SfShowListingEntitiesDTO::class.java)
      .body

  fun fetchExtendedInfo(sfId: String): SfExtendedMovieDTO {
    val responseEntity = restTemplate
      .exchange(API_URL + "/v1/movies/{sfId}", HttpMethod.GET, httpEntity, SfExtendedMovieDTO::class.java, sfId)
    return responseEntity.body
  }

  fun allMovies(cityAlias: String = "GB"): List<SfMovieDTO> {
    return restTemplate
      .exchange(API_URL + "/v1/movies/category/All?Page=1&PageSize=1024&blockId=1592&CityAlias=$cityAlias&", HttpMethod.GET,
        httpEntity, object : ParameterizedTypeReference<List<SfMovieDTO>>() {})
      .body
  }
}

