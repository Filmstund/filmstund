package se.filmstund.services.external

import org.slf4j.LoggerFactory
import org.springframework.cache.annotation.CacheConfig
import org.springframework.cache.annotation.Cacheable
import org.springframework.core.ParameterizedTypeReference
import org.springframework.http.HttpEntity
import org.springframework.http.HttpMethod
import org.springframework.stereotype.Service
import org.springframework.web.client.RestTemplate
import org.springframework.web.util.UriComponentsBuilder
import se.filmstund.ExternalProviderException
import se.filmstund.Properties
import se.filmstund.domain.dto.FilmstadenCinemaWithAddressDTO
import se.filmstund.domain.dto.FilmstadenExtendedMovieDTO
import se.filmstund.domain.dto.FilmstadenLocationItemsDTO
import se.filmstund.domain.dto.FilmstadenMovieDTO
import se.filmstund.domain.dto.FilmstadenMovieItemsDTO
import se.filmstund.domain.dto.FilmstadenSeatMapDTO
import se.filmstund.domain.dto.FilmstadenShowDTO
import se.filmstund.domain.dto.FilmstadenShowItemsDTO
import se.filmstund.domain.dto.FilmstadenShowingDTO
import se.filmstund.domain.dto.FilmstadenTicketDTO
import se.filmstund.domain.id.FilmstadenNcgID
import java.time.ZoneOffset
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter
import java.time.temporal.ChronoUnit

@Service
@CacheConfig(cacheNames = ["filmstaden"])
class FilmstadenService(
  private val restTemplate: RestTemplate,
  private val httpEntity: HttpEntity<Void>,
  private val properties: Properties
) {

  companion object {
    private const val API_URL = "https://www.filmstaden.se/api"
    private const val SHOW_URL = "$API_URL/v2/show/sv/1/200"
    private const val CINEMA_URL = "$API_URL/v2/cinema/sv/1/200"
    private const val MOVIES_URL = "$API_URL/v2/movie/sv/1/1000"
    private const val SEAT_MAP_URL = "$API_URL/v2/show/seats/sv/{cinemaId}/{screenId}"
    private val log = LoggerFactory.getLogger(FilmstadenService::class.java)
  }

  @Cacheable
  fun getShowingDates(filmstadenId: FilmstadenNcgID, cityAlias: String = "GB"): List<FilmstadenShowingDTO> {
    val startTime = currentDateTimeTruncatedToNearestHalfHour()
      .format(DateTimeFormatter.ofPattern("uuuu-MM-dd'T'HH:mm"))

    val uri = UriComponentsBuilder.fromUriString(SHOW_URL)
      .queryParam("filter.countryAlias", "se")
      .queryParam("filter.cityAlias", cityAlias)
      .queryParam("filter.movieNcgId", filmstadenId)
      .queryParam("filter.timeUtc.greaterThanOrEqualTo", startTime)
      .build().toUri()

    val responseBody = restTemplate
      .exchange(uri, HttpMethod.GET, httpEntity, object : ParameterizedTypeReference<FilmstadenShowItemsDTO>() {})
      .body ?: throw ExternalProviderException("[Filmstaden] Response body is null")

    log.debug("Found {} showings for {} in {}", responseBody.totalNbrOfItems, filmstadenId, cityAlias)
    return responseBody.items.map { FilmstadenShowingDTO.from(it) }.sortedBy { it.timeUtc }
  }

  @Cacheable
  fun getLocationsInCity(cityAlias: String = properties.defaultCity): List<FilmstadenCinemaWithAddressDTO> {
    val uri = UriComponentsBuilder.fromUriString(CINEMA_URL)
      .queryParam("filter.countryAlias", "se")
      .queryParam("filter.cityAlias", cityAlias)
      .build().toUri()

    log.debug("Fetching locations in {} from Filmstaden API", cityAlias)
    val responseBody = restTemplate
      .exchange(uri, HttpMethod.GET, httpEntity, object : ParameterizedTypeReference<FilmstadenLocationItemsDTO>() {})
      .body ?: throw ExternalProviderException("[Filmstaden] Response body is null")

    return responseBody.items
  }

  @Cacheable
  fun fetchExtendedInfo(filmstadenId: FilmstadenNcgID): FilmstadenExtendedMovieDTO? {
    val body = restTemplate.exchange(
      "$API_URL/v2/movie/sv/{filmstadenId}",
      HttpMethod.GET,
      httpEntity,
      FilmstadenExtendedMovieDTO::class.java,
      filmstadenId
    ).body
    if (body?.ncgId == null) {
      return null
    }
    return body
  }

  fun allMovies(): List<FilmstadenMovieDTO> {
    val responseBody = restTemplate
      .exchange(
        MOVIES_URL,
        HttpMethod.GET,
        httpEntity,
        object : ParameterizedTypeReference<FilmstadenMovieItemsDTO>() {})
      .body ?: throw ExternalProviderException("[Filmstaden] Response body is null")

    return responseBody.items
  }

  // https://www.filmstaden.se/api/v2/ticket/Sys99-SE/AA-1034-201708222100/RE-4HMOMOJFKH?imageContentType=webp
  @Cacheable
  fun fetchTickets(sysId: String, filmstadenShowingId: String, ticketId: String): List<FilmstadenTicketDTO> {
    val url = "$API_URL/v2/ticket/$sysId/$filmstadenShowingId/$ticketId"

    log.debug("Fetching tickets from $url")
    return restTemplate
      .exchange(url, HttpMethod.GET, httpEntity, object : ParameterizedTypeReference<List<FilmstadenTicketDTO>>() {})
      .body ?: listOf()
  }

  /** Returns base64 encoding jpeg of the ticket */
  @Cacheable
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

  fun getFilmstadenBuyLink(filmstadenId: String?, slug: String?): String? = when {
    filmstadenId != null && slug != null -> "https://www.filmstaden.se/film/${filmstadenId}/${slug}"
    else -> null
  }

  @Cacheable
  fun getFilmstadenSeatMap(cinemaId: String, screenId: String): List<FilmstadenSeatMapDTO> {
    log.debug("Fetching seat map from $SEAT_MAP_URL with cinemaId=$cinemaId, screenId=$screenId")
    return restTemplate
      .exchange(
        SEAT_MAP_URL,
        HttpMethod.GET,
        httpEntity,
        object : ParameterizedTypeReference<List<FilmstadenSeatMapDTO>>() {},
        cinemaId,
        screenId
      )
      .body ?: listOf()
  }

  @Cacheable
  fun fetchFilmstadenShow(filmstadenRemoteEntityId: String): FilmstadenShowDTO {

    val filmstadenShowItemsDTO = restTemplate
      .exchange(
        "$API_URL/v2/show/sv/1/200?filter.remoteEntityId=$filmstadenRemoteEntityId",
        HttpMethod.GET,
        httpEntity,
        object : ParameterizedTypeReference<FilmstadenShowItemsDTO>() {}
      ).body ?: throw ExternalProviderException("[Filmstaden] Response body is null")

    if (filmstadenShowItemsDTO.totalNbrOfItems != 1) {
      throw ExternalProviderException("[Filmstaden] More than one show found in Filmstaden API")
    }

    return filmstadenShowItemsDTO.items.first()

  }
}
