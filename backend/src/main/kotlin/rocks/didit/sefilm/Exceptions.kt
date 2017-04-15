package rocks.didit.sefilm

import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus

@ResponseStatus(HttpStatus.NOT_FOUND)
class NotFoundException(what: String) : RuntimeException("Could not find $what")

@ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
class MissingParametersException() : RuntimeException("Some required parameters were missing")

@ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
class ExternalProviderException() : RuntimeException("Unable to fetch information from external provider")

@ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
class MissingSfIdException() : RuntimeException("Movie does not have a valid SF id associated with it")

@ResponseStatus(HttpStatus.BAD_REQUEST)
class BadRequestException(msg: String) : RuntimeException(msg)
