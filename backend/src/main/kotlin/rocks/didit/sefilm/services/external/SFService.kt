package rocks.didit.sefilm.services.external

import org.slf4j.LoggerFactory
import org.springframework.cache.annotation.Cacheable
import org.springframework.core.ParameterizedTypeReference
import org.springframework.http.HttpEntity
import org.springframework.http.HttpMethod
import org.springframework.stereotype.Service
import org.springframework.web.client.RestTemplate
import org.springframework.web.util.UriComponentsBuilder
import rocks.didit.sefilm.ExternalProviderException
import rocks.didit.sefilm.NotFoundException
import rocks.didit.sefilm.Properties
import rocks.didit.sefilm.database.repositories.MovieRepository
import rocks.didit.sefilm.domain.dto.*
import java.time.ZoneOffset
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter
import java.time.temporal.ChronoUnit
import java.util.*

@Service
class SFService(
  private val movieRepo: MovieRepository,
  private val restTemplate: RestTemplate,
  private val httpEntity: HttpEntity<Void>,
  private val properties: Properties
) {

  companion object {
    private const val API_URL = "https://www.sf.se/api"
    private const val SHOW_URL = "$API_URL/v2/show/sv/1/200"
    private const val CINEMA_URL = "$API_URL/v2/cinema/sv/1/200"
    private const val MOVIES_URL = "$API_URL/v2/movie/sv/1/1000"
    private const val SEAT_MAP_URL = "$API_URL/v2/show/seats/sv/{cinemaId}/{screenId}"
    private val log = LoggerFactory.getLogger(SFService::class.java)
  }

  @Cacheable("sfdates")
  fun getShowingDates(sfId: String, cityAlias: String = "GB"): List<SfShowingDTO> {
    val startTime = currentDateTimeTruncatedToNearestHalfHour()
      .format(DateTimeFormatter.ofPattern("uuuu-MM-dd'T'HH:mm"))

    val uri = UriComponentsBuilder.fromUriString(SHOW_URL)
      .queryParam("filter.countryAlias", "se")
      .queryParam("filter.cityAlias", cityAlias)
      .queryParam("filter.movieNcgId", sfId)
      .queryParam("filter.timeUtc.greaterThanOrEqualTo", startTime)
      .build().toUri()

    val responseBody = restTemplate
      .exchange(uri, HttpMethod.GET, httpEntity, object : ParameterizedTypeReference<SfShowItemsDTO>() {})
      .body ?: throw ExternalProviderException("[SF] Response body is null")

    return responseBody.items.map { SfShowingDTO.from(it) }.sortedBy { it.timeUtc }
  }

  fun getLocationsInCity(cityAlias: String = properties.defaultCity): List<SfCinemaWithAddressDTO> {
    val uri = UriComponentsBuilder.fromUriString(CINEMA_URL)
      .queryParam("filter.countryAlias", "se")
      .queryParam("filter.cityAlias", cityAlias)
      .build().toUri()

    val responseBody = restTemplate
      .exchange(uri, HttpMethod.GET, httpEntity, object : ParameterizedTypeReference<SfLocationItemsDTO>() {})
      .body ?: throw ExternalProviderException("[SF] Response body is null")

    return responseBody.items
  }

  fun fetchExtendedInfo(sfId: String): SfExtendedMovieDTO? {
    val body = restTemplate.exchange(
      API_URL + "/v2/movie/sv/{sfId}",
      HttpMethod.GET,
      httpEntity,
      SfExtendedMovieDTO::class.java,
      sfId
    ).body
    if (body?.ncgId == null) {
      return null
    }
    return body
  }

  fun allMovies(): List<SfMovieDTO> {
    val responseBody = restTemplate
      .exchange(MOVIES_URL, HttpMethod.GET, httpEntity, object : ParameterizedTypeReference<SfMovieItemsDTO>() {})
      .body ?: throw ExternalProviderException("[SF] Response body is null")

    return responseBody.items
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

  private fun currentDateTimeTruncatedToNearestHalfHour(): ZonedDateTime {
    val now = ZonedDateTime.now(ZoneOffset.UTC)
    return now.truncatedTo(ChronoUnit.HOURS)
      .plusMinutes(30L * (now.minute / 30L))
  }

  fun getSfBuyLink(movieId: UUID?): String? {
    if (movieId == null) {
      throw IllegalArgumentException("Missing movie ID")
    }
    val movie = movieRepo
      .findById(movieId)
      .orElseThrow { NotFoundException("movie '$movieId") }

    return when {
      movie.sfId != null && movie.sfSlug != null -> "https://www.sf.se/film/${movie.sfId}/${movie.sfSlug}"
      else -> null
    }
  }

  @Cacheable("sfSeatMap")
  fun getSfSeatMap(cinemaId: String, screenId: String): List<SfSeatMapDTO> {
    log.debug("Fetching seat map from $SEAT_MAP_URL with cinemaId=$cinemaId, screenId=$screenId")
    return restTemplate
      .exchange(
        SEAT_MAP_URL,
        HttpMethod.GET,
        httpEntity,
        object : ParameterizedTypeReference<List<SfSeatMapDTO>>() {},
        cinemaId,
        screenId
      )
      .body ?: listOf()
  }
}

