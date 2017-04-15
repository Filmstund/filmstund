package rocks.didit.sefilm.web.controllers

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.autoconfigure.web.servlet.error.ErrorAttributes
import org.springframework.boot.autoconfigure.web.servlet.error.ErrorController
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.context.request.ServletRequestAttributes
import rocks.didit.sefilm.domain.ErrorDTO
import java.util.*
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse


@RestController
class CustomErrorController : ErrorController {
    companion object {
        private const val PATH = "/error"
    }

    @Autowired
    private val errorAttributes: ErrorAttributes? = null

    @RequestMapping(value = PATH)
    internal fun error(request: HttpServletRequest, response: HttpServletResponse): ErrorDTO {
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

    private fun getErrorAttributes(request: HttpServletRequest, includeStackTrace: Boolean): Map<String, Any> {
        val requestAttributes = ServletRequestAttributes(request)
        return errorAttributes!!.getErrorAttributes(requestAttributes, includeStackTrace)
    }

    private fun getError(request: HttpServletRequest): Throwable? {
        val requestAttributes = ServletRequestAttributes(request)
        return errorAttributes!!.getError(requestAttributes)
    }
}

