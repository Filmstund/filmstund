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
import rocks.didit.sefilm.database.mongo.repositories.MovieMongoRepository
import rocks.didit.sefilm.domain.dto.*
import java.time.ZoneOffset
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter
import java.time.temporal.ChronoUnit
import java.util.*

@Service
class FilmstadenService(
  private val movieRepo: MovieMongoRepository,
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

  @Cacheable("filmstadenDates")
  fun getShowingDates(filmstadenId: String, cityAlias: String = "GB"): List<FilmstadenShowingDTO> {
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

    return responseBody.items.map { FilmstadenShowingDTO.from(it) }.sortedBy { it.timeUtc }
  }

  fun getLocationsInCity(cityAlias: String = properties.defaultCity): List<FilmstadenCinemaWithAddressDTO> {
    val uri = UriComponentsBuilder.fromUriString(CINEMA_URL)
      .queryParam("filter.countryAlias", "se")
      .queryParam("filter.cityAlias", cityAlias)
      .build().toUri()

    val responseBody = restTemplate
      .exchange(uri, HttpMethod.GET, httpEntity, object : ParameterizedTypeReference<FilmstadenLocationItemsDTO>() {})
      .body ?: throw ExternalProviderException("[Filmstaden] Response body is null")

    return responseBody.items
  }

  fun fetchExtendedInfo(filmstadenId: String): FilmstadenExtendedMovieDTO? {
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
  fun fetchTickets(sysId: String, filmstadenShowingId: String, ticketId: String): List<FilmstadenTicketDTO> {
    val url = "$API_URL/v2/ticket/$sysId/$filmstadenShowingId/$ticketId"

    log.debug("Fetching tickets from $url")
    return restTemplate
      .exchange(url, HttpMethod.GET, httpEntity, object : ParameterizedTypeReference<List<FilmstadenTicketDTO>>() {})
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

  fun getFilmstadenBuyLink(movieId: UUID?): String? {
    if (movieId == null) {
      throw IllegalArgumentException("Missing movie ID")
    }
    val movie = movieRepo
      .findById(movieId)
      .orElseThrow { NotFoundException("movie '$movieId") }

    return when {
      movie.filmstadenId != null && movie.filmstadenSlug != null -> "https://www.filmstaden.se/film/${movie.filmstadenId}/${movie.filmstadenSlug}"
      else -> null
    }
  }

  @Cacheable("filmstadenSeatMap")
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

