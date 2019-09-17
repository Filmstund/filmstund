package rocks.didit.sefilm.web.controllers

import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.ResponseBody
import org.springframework.web.bind.annotation.ResponseStatus
import rocks.didit.sefilm.domain.ErrorDTO

@ControllerAdvice
class ExceptionAdvice {
  @ExceptionHandler(IllegalArgumentException::class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  @ResponseBody
  fun handleIllegalArgumentException(e: IllegalArgumentException): ErrorDTO {
    return ErrorDTO(
      status_code = HttpStatus.BAD_REQUEST.value(),
      status_text = HttpStatus.BAD_REQUEST.reasonPhrase,
      reason = e.localizedMessage
    )
  }
}