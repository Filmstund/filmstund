package rocks.didit.sefilm

import rocks.didit.sefilm.domain.TicketNumber
import rocks.didit.sefilm.domain.UserID
import java.util.*

class NotFoundException(what: String, userID: UserID? = null, showingId: UUID? = null) :
  KnownException("Could not find $what", userID, showingId)

class MissingPhoneNumberException(userID: UserID) :
  KnownException("You are missing a phone number.", userID)

class MissingParametersException(what: String = "") : KnownException("Some required parameters were missing: $what")

class ExternalProviderException(msg: String) :
  KnownException("Unable to fetch information from external provider: $msg")

class MissingAPIKeyException(service: APIService) : KnownException("The API key is missing or invalid for the $service service")

class TicketsAlreadyBoughtException(userID: UserID, showingId: UUID) :
  KnownException("The action is not allowed since the tickets for this showing is already bought", userID, showingId)

class TicketAlreadyInUserException(userID: UserID) :
  KnownException("One or more of your företagsbiljeter is already in use", userID)

class UserAlreadyAttendedException(userID: UserID) :
  KnownException("The user has already attended this showing", userID)

class TicketNotFoundException(ticketNumber: TicketNumber) : KnownException("Ticket $ticketNumber not found")

class DuplicateTicketException(msg: String = "") : KnownException("Found duplicate tickets$msg")

class TicketAlreadyUsedException(whichTicket: TicketNumber) : KnownException("The ticket $whichTicket has already been used")

class TicketExpiredException(whichTicket: TicketNumber) :
  KnownException("The ticket $whichTicket has expired or will expire before the showing will be bought")

class TicketInUseException(whichTicket: TicketNumber) :
  KnownException("The ticket $whichTicket is already in use on a showing and cannot be removed")

class SfTicketException(msg: String) : KnownException(msg)

open class KnownException(
  msg: String,
  val whichUser: UserID? = null,
  val whichShowing: UUID? = null
) : RuntimeException(msg)

/** Services which uses some form of tokens, and that can cause InvalidTokenException */
enum class APIService {
  Pushover,
  IMDb,
  TMDb
}