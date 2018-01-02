package rocks.didit.sefilm.domain

import org.slf4j.LoggerFactory
import org.springframework.http.HttpMethod
import org.springframework.http.client.ClientHttpResponse
import org.springframework.web.client.ResponseErrorHandler
import rocks.didit.sefilm.ExternalProviderException
import java.net.URI
import java.time.Instant

data class ErrorDTO(val error: Boolean = true,
                    val timestamp: Instant = Instant.now(),
                    val status_code: Int = 500,
                    val status_text: String? = null,
                    val reason: String? = null)

internal class ExternalProviderErrorHandler : ResponseErrorHandler {
  private val log = LoggerFactory.getLogger(ExternalProviderErrorHandler::class.java)
  override fun hasError(response: ClientHttpResponse): Boolean {
    return response.rawStatusCode >= 400
  }

  override fun handleError(url: URI, method: HttpMethod, response: ClientHttpResponse) {
    log.warn("$method $url -> ${response.statusCode}: ${response.statusText}")
    throw ExternalProviderException("${response.statusCode}: ${response.statusText}")
  }

  override fun handleError(response: ClientHttpResponse) {
    log.warn("Error when fetching info from external provider: ${response.statusCode}: ${response.statusText}")
    throw ExternalProviderException("${response.statusCode}: ${response.statusText}")
  }
}
