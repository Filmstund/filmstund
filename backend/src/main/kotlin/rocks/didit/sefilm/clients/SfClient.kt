package rocks.didit.sefilm.clients

import org.springframework.core.ParameterizedTypeReference
import org.springframework.http.HttpEntity
import org.springframework.http.HttpMethod
import org.springframework.stereotype.Component
import org.springframework.web.client.RestTemplate
import rocks.didit.sefilm.domain.dto.*
import java.time.LocalDate
import java.time.ZoneOffset
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter
import java.time.temporal.ChronoUnit

@Component
class SfClient(private val restTemplate: RestTemplate, private val httpEntity: HttpEntity<Void>) {
  companion object {
    const val API_URL = "https://www.sf.se/api"
    const val AGGREGATIONS_URL = "$API_URL/v2/show/aggregations"
  }

  fun getShowingDates(sfId: String): List<LocalDate> {
    val startTime = currentDateTimeTruncatedToNearestHalfHour()
      .format(DateTimeFormatter.ofPattern("uuuu-MM-dd'T'HH:mm"))
    val filters = mapOf(
      "countryAlias" to "se",
      "cityAlias" to listOf("GB"),
      "movieNcgId" to listOf(sfId),
      "timeUtc" to mapOf("greaterThanOrEqualTo" to startTime)
    )
    val sfAggregationRequest = SfAggregationRequest(filters, "dates", listOf(SfAggregationProperty("TimeUtc")))
    val body = SfRequestAggregations(listOf(sfAggregationRequest))

    val aggregationsEntity = HttpEntity<SfRequestAggregations>(body, httpEntity.headers)
    val responseBody = restTemplate.exchange(AGGREGATIONS_URL, HttpMethod.POST, aggregationsEntity, SfResponseAggregations::class.java).body

    return responseBody.aggregations.first().buckets.map {
      LocalDate.parse(it.properties["timeUtc"].toString())
    }
  }

  /** Date must be in ISO8601 format, i.e 2017-04-11 */
  fun getScreensForDateAndMovie(sfId: String, date: String): SfShowListingEntitiesDTO =
    restTemplate
      .exchange("$API_URL/v1/shows/ShowListing?Cinemas=&Movies=$sfId&Cities=GB&GroupBy=Cinema&ShowListingFilterDate.SelectedDate=$date&BlockId=1443&imageContentType=webp", HttpMethod.GET, httpEntity, SfShowListingEntitiesDTO::class.java)
      .body

  fun fetchExtendedInfo(sfId: String): SfExtendedMovieDTO {
    val responseEntity = restTemplate
      .exchange(API_URL + "/v1/movies/{sfId}", HttpMethod.GET, httpEntity, SfExtendedMovieDTO::class.java, sfId)
    return responseEntity.body
  }

  fun allMovies(cityAlias: String = "GB"): List<SfMovieDTO> {
    return restTemplate
      .exchange("$API_URL/v1/movies/category/All?Page=1&PageSize=1024&blockId=1592&CityAlias=$cityAlias&", HttpMethod.GET,
        httpEntity, object : ParameterizedTypeReference<List<SfMovieDTO>>() {})
      .body
  }

  // https://www.sf.se/api/v2/ticket/Sys99-SE/AA-1034-201708222100/RE-4HMOMOJFKH?imageContentType=webp
  fun fetchTickets(sysId: String, sfShowingId: String, ticketId: String): List<SfTicketDTO> {
    val url = "$API_URL/v2/ticket/$sysId/$sfShowingId/$ticketId"
    return restTemplate
      .exchange(url, HttpMethod.GET, httpEntity, object : ParameterizedTypeReference<List<SfTicketDTO>>() {})
      .body
  }

  /** Returns base64 encoding jpeg of the ticket */
  fun fetchBarcode(ticketId: String): String {
    val url = "$API_URL/v2/barcode/{ticketId}/128/128"
    return restTemplate
      .exchange(url, HttpMethod.GET, httpEntity, String::class.java, ticketId)
      .body
      .replace("\"", "")
  }

  fun currentDateTimeTruncatedToNearestHalfHour(): ZonedDateTime {
    val now = ZonedDateTime.now(ZoneOffset.UTC)
    return now.truncatedTo(ChronoUnit.HOURS)
      .plusMinutes(30L * (now.minute / 30L))
  }
}

