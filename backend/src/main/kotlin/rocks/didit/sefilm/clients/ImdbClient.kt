package rocks.didit.sefilm.clients

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import org.apache.log4j.Logger
import org.springframework.http.HttpEntity
import org.springframework.http.HttpMethod
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder
import org.springframework.stereotype.Component
import org.springframework.web.client.RestTemplate
import org.springframework.web.client.exchange
import org.springframework.web.util.UriUtils
import rocks.didit.sefilm.ExternalProviderException
import rocks.didit.sefilm.MissingAPIKeyException
import rocks.didit.sefilm.Properties
import rocks.didit.sefilm.domain.dto.ImdbResult
import rocks.didit.sefilm.domain.dto.ImdbSearchResults
import rocks.didit.sefilm.domain.dto.TmdbFindExternalResults
import rocks.didit.sefilm.domain.dto.TmdbMovieDetails

@Component
class ImdbClient(private val restTemplate: RestTemplate, private val httpEntity: HttpEntity<Void>, private val properties: Properties) {
  companion object {
    private const val TMDB_EXTERNAL_SEARCH_URL = "https://api.themoviedb.org/3/find/%s?api_key=%s&language=en-US&external_source=imdb_id"
    private const val TMDB_INFO_URL = "https://api.themoviedb.org/3/movie/%d?api_key=%s&language=en-US"
    private const val SEARCH_URL = "https://v2.sg.media-imdb.com/suggests/%s/%s.json" // Spaces should be replaced with _
    private fun getSearchUrl(query: String): String {
      if (query.isNullOrBlank()) throw IllegalArgumentException("Query cannot be blank")

      val normalized = query.removeSwedishChars()
      val encodedQuery = UriUtils.encode(normalized.replace(" ", "_"), Charsets.UTF_8)
      return SEARCH_URL.format(normalized[0], encodedQuery)
    }

    private fun String.removeSwedishChars() =
      this.toLowerCase()
        .replace("å", "a")
        .replace("ä", "a")
        .replace("ö", "o")
        .replace("!", "")
        .replace("?", "")

    fun String.isValidImdbId() = Regex("tt[0-9]{7}").matches(this)
  }

  private val log = Logger.getLogger(ImdbClient::class.java)

  private fun lookupTmdbIdFromImdbId(imdbId: String): Long? {
    validateImdbId(imdbId)
    validateApiKeyExists(imdbId)
    val url = TMDB_EXTERNAL_SEARCH_URL.format(imdbId, properties.tmdb.apikey)
    val results = restTemplate.exchange<TmdbFindExternalResults>(url, HttpMethod.GET, httpEntity, TmdbFindExternalResults::class.java::class).body

    return results.movie_results.getOrNull(0)?.id
      ?: return null
  }

  fun search(title: String): List<ImdbResult> {
    val url = getSearchUrl(title)
    val resultWithCallback = restTemplate.exchange<String>(url, HttpMethod.GET, httpEntity, String::javaClass).body
    val resultWithoutCallback = removeCallback(resultWithCallback)
    return jsonToSearchResult(resultWithoutCallback).d
      ?.filter { it.q == "feature" } ?: listOf()
  }

  /**
   * @throws MissingAPIKeyException if the TMDB api hasn't been supplied
   * @throws ExternalProviderException if the movie was not found or if the ID didn't uniquely identify the movie
   */
  fun movieDetails(imdbId: String): TmdbMovieDetails {
    validateImdbId(imdbId)
    validateApiKeyExists(imdbId)

    val tmdbId = lookupTmdbIdFromImdbId(imdbId) ?: throw ExternalProviderException("movie[$imdbId] not found")

    val url = TMDB_INFO_URL.format(tmdbId, properties.tmdb.apikey)
    val body = restTemplate.exchange<TmdbMovieDetails>(url, HttpMethod.GET, httpEntity, TmdbMovieDetails::class).body
    return body
  }

  private fun validateImdbId(imdbId: String) {
    if (!imdbId.isValidImdbId()) throw IllegalArgumentException("$imdbId is not a valid IMDb ID")
  }

  private fun validateApiKeyExists(imdbId: String) {
    if (!properties.tmdb.apiKeyExists()) {
      log.warn("TMDB api not set. Unable to fetch info for $imdbId")
      throw MissingAPIKeyException("TMDB")
    }
  }

  /** IMDb returns jsonp with a callback we need to remove */
  private fun removeCallback(result: String): String {
    if (result.isNullOrBlank()) throw IllegalArgumentException("Result with callback mustn't be empty")
    val firstParenthesis = result.indexOf("(") + 1
    val lastParenthesis = result.lastIndexOf(")")
    return result.substring(firstParenthesis, lastParenthesis)
  }

  private fun jsonToSearchResult(json: String): ImdbSearchResults {
    val objectMapper = Jackson2ObjectMapperBuilder.json().build<ObjectMapper>()
    return objectMapper.readValue<ImdbSearchResults>(json)
  }
}