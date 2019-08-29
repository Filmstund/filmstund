package rocks.didit.sefilm.services.external

import com.fasterxml.jackson.databind.ObjectMapper
import org.slf4j.LoggerFactory
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

    companion object {
        private val log = LoggerFactory.getLogger(SlackService::class.java)
    }



    @Async
    fun postNewShowing(showing: Showing) {
        val slackUrl = properties.slack.slackHookUrl
        if(slackUrl.trim().isEmpty()) {
            log.info("Missing slackHookUrl")
            return
        }

        val headers = HttpHeaders()
        headers.contentType = MediaType.APPLICATION_JSON
        val payload = mapOf(
                "text" to "Ny visning: <${properties.baseUrl.frontend}/showings/${showing.webId}/${showing.slug}>",
                "icon_emoji" to ":sf:",
                "username" to "SeFilm"
        )
        val request = HttpEntity<String>(objectMapper.writeValueAsString(payload), headers)
        try {
            restTemplate.postForEntity(slackUrl, request, String::class.java)
        } catch (e: Exception) {
            log.warn("Failed to post Slack Webhook", e)
        }
    }

}
