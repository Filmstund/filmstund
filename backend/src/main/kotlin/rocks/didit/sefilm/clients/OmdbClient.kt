package rocks.didit.sefilm.clients

import org.springframework.stereotype.Component
import org.springframework.web.client.RestTemplate
import rocks.didit.sefilm.domain.dto.OmdbApiMovieDTO


@Component
class OmdbClient(private val restTemplate: RestTemplate) {
    companion object {
        const val API_URL = "http://www.omdbapi.com/"
    }

    fun fetchOmdbExtendedInfo(uri: String, params: Map<String, Any?>): OmdbApiMovieDTO? =
            restTemplate.getForEntity(uri, OmdbApiMovieDTO::class.java, params).body
}