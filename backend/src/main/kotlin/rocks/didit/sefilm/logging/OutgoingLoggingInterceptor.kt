package rocks.didit.sefilm.logging

import org.springframework.http.HttpHeaders
import org.springframework.http.HttpRequest
import org.springframework.http.client.ClientHttpRequestExecution
import org.springframework.http.client.ClientHttpRequestInterceptor
import org.springframework.http.client.ClientHttpResponse
import rocks.didit.sefilm.logger
import java.io.BufferedReader
import java.io.InputStreamReader
import java.time.Duration
import java.time.Instant
import java.util.concurrent.atomic.AtomicLong

class OutgoingLoggingInterceptor : ClientHttpRequestInterceptor {
  private val logger by logger()
  private val counter = AtomicLong(0)

  override fun intercept(request: HttpRequest, body: ByteArray, execution: ClientHttpRequestExecution): ClientHttpResponse {
    val currentCount = counter.getAndIncrement()
    logRequest(request, body, currentCount)
    val startRequestTime = Instant.now()
    val response = execution.execute(request, body)
    logResponse(response, currentCount, startRequestTime)
    return response
  }

  private fun logRequest(request: HttpRequest, body: ByteArray, currentCount: Long) {
    if (!logger.isDebugEnabled) {
      return
    }

    logger.debug("\n$currentCount > ${request.method} ${request.uri}" +
      "\n${assembleHeadersWithPrependedCounter(request.headers, currentCount)}" +
      "\n${currentCount} > ${String(body, Charsets.UTF_8)}")
  }

  private fun assembleHeadersWithPrependedCounter(headers: HttpHeaders, counter: Long, separator: String = ">"): String {
    return headers
      .map { "$counter $separator ${it.key}: ${it.value.joinToString(",")}" }
      .joinToString("\n")
  }

  private fun logResponse(response: ClientHttpResponse, currentCount: Long, startRequestTime: Instant) {
    if (!logger.isDebugEnabled) {
      return
    }
    val requestDuration = Duration.between(startRequestTime, Instant.now())
    val inputStringBuilder = StringBuilder()
    val bufferedReader = BufferedReader(InputStreamReader(response.body, Charsets.UTF_8))
    var line: String? = bufferedReader.readLine()
    while (line != null) {
      inputStringBuilder.append(line)
      inputStringBuilder.append('\n')
      line = bufferedReader.readLine()
    }
    logger.debug("Request processed in ${requestDuration.toMillis()} ms" +
      "\n$currentCount < ${response.rawStatusCode}" +
      "\n${assembleHeadersWithPrependedCounter(response.headers, currentCount, "<")}" +
      "\n${currentCount} < ${inputStringBuilder.toString()}")
  }

}