package rocks.didit.sefilm.clients

import org.springframework.stereotype.Component
import org.springframework.web.client.RestTemplate
import rocks.didit.sefilm.domain.dto.OmdbApiMovieDTO


@Component
class OmdbClient(private val restTemplate: RestTemplate) {
    companion object {
        const val API_URL = "http://www.omdbapi.com/"
    }

    fun fetchByImdbId(imdbId: String): OmdbApiMovieDTO? =
            fetchOmdbExtendedInfo(OmdbClient.API_URL + "/?i={id}", mapOf("id" to imdbId))

    fun fetchByTitleAndYear(title: String, year: Int): OmdbApiMovieDTO? =
            fetchOmdbExtendedInfo(OmdbClient.API_URL + "/?t={title}&y={year}", mapOf("title" to title, "year" to year))

    private fun fetchOmdbExtendedInfo(uri: String, params: Map<String, Any?>): OmdbApiMovieDTO? =
            restTemplate.getForEntity(uri, OmdbApiMovieDTO::class.java, params).body
}