package rocks.didit.sefilm.clients

import org.slf4j.LoggerFactory
import org.springframework.core.ParameterizedTypeReference
import org.springframework.http.HttpEntity
import org.springframework.http.HttpMethod
import org.springframework.stereotype.Component
import org.springframework.web.client.RestTemplate
import org.springframework.web.client.getForEntity
import org.springframework.web.util.UriComponentsBuilder
import rocks.didit.sefilm.ExternalProviderException
import rocks.didit.sefilm.domain.dto.*
import java.time.ZoneOffset
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter
import java.time.temporal.ChronoUnit

@Component
class SfClient(private val restTemplate: RestTemplate, private val httpEntity: HttpEntity<Void>) {
  companion object {
    const val API_URL = "https://www.sf.se/api"
    const val SHOW_URL = "$API_URL/v2/show/sv/1/200"
    private val log = LoggerFactory.getLogger(SfClient::class.java)
  }

  fun getShowingDates(sfId: String): List<SfShowingDTO> {
    val startTime = currentDateTimeTruncatedToNearestHalfHour()
      .format(DateTimeFormatter.ofPattern("uuuu-MM-dd'T'HH:mm"))

    val uri = UriComponentsBuilder.fromUriString(SHOW_URL)
      .queryParam("filter.countryAlias", "se")
      .queryParam("filter.cityAlias", "GB")
      .queryParam("filter.movieNcgId", sfId)
      .queryParam("filter.timeUtc.greaterThanOrEqualTo", startTime)
      .build().toUri()

    val responseBody = restTemplate.getForEntity<SfShowItemsDTO>(uri)
      .body ?: throw ExternalProviderException("[SF] Response body is null")

    return responseBody.items.map { SfShowingDTO.from(it) }
  }

  fun fetchExtendedInfo(sfId: String): SfExtendedMovieDTO? {
    val body = restTemplate.exchange(API_URL + "/v1/movies/{sfId}", HttpMethod.GET, httpEntity, SfExtendedMovieDTO::class.java, sfId).body
    if (body?.ncgId == null) {
      return null
    }
    return body
  }

  fun allMovies(cityAlias: String = "GB"): List<SfMovieDTO> {
    return restTemplate
      .exchange("$API_URL/v1/movies/category/All?Page=1&PageSize=1024&blockId=1592&CityAlias=$cityAlias&", HttpMethod.GET,
        httpEntity, object : ParameterizedTypeReference<List<SfMovieDTO>>() {})
      .body ?: listOf()
  }

  // https://www.sf.se/api/v2/ticket/Sys99-SE/AA-1034-201708222100/RE-4HMOMOJFKH?imageContentType=webp
  fun fetchTickets(sysId: String, sfShowingId: String, ticketId: String): List<SfTicketDTO> {
    val url = "$API_URL/v2/ticket/$sysId/$sfShowingId/$ticketId"

    log.debug("Fetching tickets from $url")
    return restTemplate
      .exchange(url, HttpMethod.GET, httpEntity, object : ParameterizedTypeReference<List<SfTicketDTO>>() {})
      .body ?: listOf()
  }

  /** Returns base64 encoding jpeg of the ticket */
  fun fetchBarcode(ticketId: String): String {
    val url = "$API_URL/v2/barcode/{ticketId}/128/128"
    log.debug("Fetching barcode from $url")
    return restTemplate
      .exchange(url, HttpMethod.GET, httpEntity, String::class.java, ticketId)
      .body
      ?.replace("\"", "")
      ?: ""
  }

  fun currentDateTimeTruncatedToNearestHalfHour(): ZonedDateTime {
    val now = ZonedDateTime.now(ZoneOffset.UTC)
    return now.truncatedTo(ChronoUnit.HOURS)
      .plusMinutes(30L * (now.minute / 30L))
  }
}

