package rocks.didit.sefilm

import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus
import java.util.*

@ResponseStatus(HttpStatus.NOT_FOUND)
class NotFoundException(what: String) : RuntimeException("Could not find $what")

@ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
class MissingPhoneNumberException() : RuntimeException("User is missing a phone number")

@ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
class MissingParametersException() : RuntimeException("Some required parameters were missing")

@ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
class ExternalProviderException(msg: String) : RuntimeException("Unable to fetch information from external provider: $msg")

@ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
class MissingSfIdException() : RuntimeException("Movie does not have a valid SF id associated with it")

@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
class MissingAPIKeyException(service: String) : RuntimeException("The service $service is missing an API key")

@ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
class PaymentInfoMissing(showingId: UUID) : RuntimeException("Payment info for $showingId is missing")

@ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
class TicketsAlreadyBoughtException(showingId: UUID) : RuntimeException("The action is not allowd since the tickets for showing $showingId is already bought")

@ResponseStatus(HttpStatus.BAD_REQUEST)
class BadRequestException(msg: String) : RuntimeException(msg)
