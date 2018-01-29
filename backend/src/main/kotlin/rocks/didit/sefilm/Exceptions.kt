package rocks.didit.sefilm

import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus
import rocks.didit.sefilm.domain.TicketNumber
import rocks.didit.sefilm.domain.UserID
import java.util.*

@ResponseStatus(HttpStatus.NOT_FOUND)
class NotFoundException(what: String, userID: UserID? = null, showingId: UUID? = null) :
  KnownException("Could not find $what", userID, showingId)

@ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
class MissingPhoneNumberException(userID: UserID) :
  KnownException("You are missing a phone number.", userID)

@ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
class MissingParametersException(what: String = "") : KnownException("Some required parameters were missing: " + what)

@ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
class ExternalProviderException(msg: String) :
  KnownException("Unable to fetch information from external provider: $msg")

@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
class MissingAPIKeyException(service: String) : KnownException("The service $service is missing an API key")

@ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
class TicketsAlreadyBoughtException(userID: UserID, showingId: UUID) :
  KnownException("The action is not allowed since the tickets for this showing is already bought", userID, showingId)

class TicketAlreadyInUserException(userID: UserID) :
  KnownException("One or more of your företagsbiljeter is already in use", userID)

@ResponseStatus(HttpStatus.BAD_REQUEST)
class UserAlreadyAttendedException(userID: UserID) :
  KnownException("The user has already attended this showing", userID)

@ResponseStatus(HttpStatus.BAD_REQUEST)
class TicketNotFoundException(ticketNumber: TicketNumber) : KnownException("Ticket " + ticketNumber + " not found")

@ResponseStatus(HttpStatus.BAD_REQUEST)
class DuplicateTicketException(msg: String = "") : KnownException("Found duplicate tickets" + msg)

class TicketAlreadyUsedException(whichTicket: TicketNumber) :
  KnownException("The ticket $whichTicket has already been used")

class TicketExpiredException(whichTicket: TicketNumber) :
  KnownException("The ticket $whichTicket has expired or will expire before the showing will be bought")

@ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
class SfTicketException(msg: String) : KnownException(msg)

open class KnownException(
  msg: String,
  val whichUser: UserID? = null,
  val whichShowing: UUID? = null
) : RuntimeException(msg)