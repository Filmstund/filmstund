package rocks.didit.sefilm.domain

import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.client.ClientHttpResponse
import org.springframework.web.client.ResponseErrorHandler
import rocks.didit.sefilm.ExternalProviderException
import java.time.Instant

data class ErrorDTO(val error: Boolean = true,
                    val timestamp: Instant = Instant.now(),
                    val status_code: Int = 500,
                    val status_text: String? = null,
                    val reason: String? = null)

internal class ExternalProviderErrorHandler : ResponseErrorHandler {
  private val log = LoggerFactory.getLogger(ExternalProviderErrorHandler::class.java)
  override fun hasError(response: ClientHttpResponse): Boolean {
    return response.statusCode != HttpStatus.OK
  }

  override fun handleError(response: ClientHttpResponse) {
    log.error("Error when fetching movie info from external provider: ${response.statusCode}: ${response.statusText}")
    throw ExternalProviderException("${response.statusCode}: ${response.statusText}")
  }
}
