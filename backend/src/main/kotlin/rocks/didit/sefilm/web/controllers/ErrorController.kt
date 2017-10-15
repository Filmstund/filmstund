package rocks.didit.sefilm.web.controllers

import org.springframework.boot.web.servlet.error.ErrorAttributes
import org.springframework.boot.web.servlet.error.ErrorController
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.context.request.WebRequest
import rocks.didit.sefilm.domain.ErrorDTO
import java.util.*

@RestController
class ErrorController(private val errorAttributes: ErrorAttributes) : ErrorController {
  companion object {
    private const val PATH = "/error"
  }

  @RequestMapping(value = PATH)
  internal fun error(request: WebRequest): ErrorDTO {
    val errorAttribs = getErrorAttributes(request, true)
    val exception = getError(request)
    val reason = exception?.cause?.message
      ?: exception?.message
      ?: errorAttribs["message"] as String

    return ErrorDTO(reason = reason,
      status_code = errorAttribs["status"] as Int,
      status_text = errorAttribs["error"] as String,
      timestamp = (errorAttribs["timestamp"] as Date).toInstant())
  }

  override fun getErrorPath(): String {
    return PATH
  }

  private fun getErrorAttributes(request: WebRequest, includeStackTrace: Boolean): Map<String, Any> {
    return errorAttributes.getErrorAttributes(request, includeStackTrace)
  }

  private fun getError(request: WebRequest): Throwable? {
    return errorAttributes.getError(request)
  }
}

