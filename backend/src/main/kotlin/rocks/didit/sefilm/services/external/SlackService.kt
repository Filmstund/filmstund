package rocks.didit.sefilm.services.external

import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Service
import org.springframework.web.client.RestTemplate
import rocks.didit.sefilm.Properties
import rocks.didit.sefilm.database.entities.Showing


@Service
class SlackService(
        private val restTemplate: RestTemplate,
        private val objectMapper: ObjectMapper,
        private val properties: Properties
) {


    @Async
    fun postNewShowing(showing: Showing) {
        val headers = HttpHeaders()
        headers.contentType = MediaType.APPLICATION_JSON
        val payload = mapOf(
                "text" to "Ny visning: ${properties.baseUrl}/showings/${showing.webId}/${showing.slug}",
                "icon_emoji" to ":sf:"
        )
        val request = HttpEntity<String>(objectMapper.writeValueAsString(payload), headers)
        restTemplate.postForEntity(properties.slack.slackHookUrl, request, String::class.java)
    }

}