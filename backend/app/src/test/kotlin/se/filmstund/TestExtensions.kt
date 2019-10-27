package se.filmstund

import org.assertj.core.api.ObjectAssert
import se.filmstund.domain.Nick
import se.filmstund.domain.PhoneNumber
import se.filmstund.domain.SEK
import se.filmstund.domain.dto.core.AttendeeDTO
import se.filmstund.domain.dto.core.CinemaScreenDTO
import se.filmstund.domain.dto.core.GiftCertificateDTO
import se.filmstund.domain.dto.core.LocationDTO
import se.filmstund.domain.dto.core.MovieDTO
import se.filmstund.domain.dto.core.PublicUserDTO
import se.filmstund.domain.dto.core.Seat
import se.filmstund.domain.dto.core.ShowingDTO
import se.filmstund.domain.dto.core.TicketDTO
import se.filmstund.domain.dto.core.UserDTO
import se.filmstund.domain.id.Base64ID
import se.filmstund.domain.id.CalendarFeedID
import se.filmstund.domain.id.FilmstadenMembershipId
import se.filmstund.domain.id.FilmstadenNcgID
import se.filmstund.domain.id.FilmstadenShowingID
import se.filmstund.domain.id.GoogleId
import se.filmstund.domain.id.IMDbID
import se.filmstund.domain.id.MovieID
import se.filmstund.domain.id.ShowingID
import se.filmstund.domain.id.TMDbID
import se.filmstund.domain.id.TicketNumber
import se.filmstund.domain.id.UserID
import java.math.BigDecimal
import java.time.Duration
import java.time.Instant
import java.time.LocalDate
import java.time.LocalTime
import java.util.*
import java.util.concurrent.ThreadLocalRandom

private const val upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
private const val digits = "0123456789"
private val lower = upper.toLowerCase(Locale.ROOT)
private val alphanum = upper + lower + digits

fun ThreadLocalRandom.nextString(size: Int) = nextString(size, size+1)
fun ThreadLocalRandom.nextString(origin: Int = 5, bound: Int = 20): String {
  val size = nextInt(origin, bound)
  val sb = StringBuilder()

  repeat(size) {
    sb.append(alphanum[nextInt(alphanum.count())])
  }
  return sb.toString()
}

fun ThreadLocalRandom.nextUserDTO(
  id: UserID = UserID.random(),
  giftCerts: List<GiftCertificateDTO> = emptyList()
): UserDTO {
  return UserDTO(
    id = id,
    googleId = GoogleId("gid${nextString(18)}"),
    filmstadenMembershipId = FilmstadenMembershipId.from("${nextString(3)}-${nextString(3)}"),
    calendarFeedId = CalendarFeedID.random(),
    firstName = "Fname ${nextString(20)}",
    lastName = "Lname ${nextString(20)}",
    nick = Nick("Nickan ${nextString(20)}"),
    email = "mail${nextString(20)}@example.org",
    phone = PhoneNumber("073000000${nextLong(0, 9)}"),
    avatar = "http://${nextString(20)}.example.org",
    giftCertificates = giftCerts,
    lastLogin = Instant.EPOCH,
    signupDate = Instant.EPOCH,
    lastModifiedDate = Instant.EPOCH
  )
}

fun ThreadLocalRandom.nextPublicUserDTO(
  id: UserID = UserID.random()
): PublicUserDTO {
  return PublicUserDTO(
    id = id,
    firstName = "Fname ${nextString(20)}",
    lastName = "Lname ${nextString(20)}",
    nick = Nick("Nickan ${nextString(20)}"),
    phone = "073000000${nextLong(0, 9)}",
    avatar = "http://${nextString(20)}.example.org"
  )
}

fun ThreadLocalRandom.nextGiftCert(userId: UserID): GiftCertificateDTO {
  return GiftCertificateDTO(
    userId,
    TicketNumber("${this.nextLong(10000000000, 99999999999)}")
  )
}

fun ThreadLocalRandom.nextGiftCerts(userId: UserID, bound: Int = 10): List<GiftCertificateDTO> = (0..bound).map {
  this.nextGiftCert(userId)
}

fun ThreadLocalRandom.nextLocation(alias: List<String> = nextLocationAlias(3)): LocationDTO {
  return LocationDTO(
    name = "locname${nextString (50)}",
    cityAlias = "${this.nextInt(10, 99)}",
    city = "city$${nextString(20)}",
    streetAddress = "streetAddr${nextString(20)}",
    postalAddress = "postalAddr${nextString(20)}",
    postalCode = "${nextLong(1000, 10000)}",
    latitude = BigDecimal.valueOf(this.nextLong(1, 10)),
    longitude = BigDecimal.valueOf(this.nextLong(1, 10)),
    filmstadenId = "NCG${nextString(7)}",
    alias = alias,
    lastModifiedDate = Instant.EPOCH
  )
}

fun ThreadLocalRandom.nextLocationAlias(bound: Int): List<String> {
  return (0..bound).map { "alias${nextString(20)}" }
}

fun ThreadLocalRandom.nextMovie(genreBound: Int = 5): MovieDTO {
  return MovieDTO(
    id = MovieID.random(),
    filmstadenId = FilmstadenNcgID("fsid${nextLong(10000000000)}"),
    imdbId = IMDbID("tt${nextLong(1000000, 9999999)}"),
    tmdbId = TMDbID(nextLong(0, 1000000)),
    slug = "slug${nextLong()}",
    title = "title${nextLong()}",
    synopsis = "synopsis${nextLong()}",
    originalTitle = "orgTitle${nextLong()}",
    releaseDate = nextLocalDate(),
    productionYear = nextInt(1900, 2020),
    runtime = Duration.ofHours(nextLong(1, 20)),
    poster = "https://post${nextLong()}.example.org",
    genres = (0..genreBound).map { "genre${nextLong()}" }.toSet(),
    popularity = nextDouble(0.0, 1000.0),
    popularityLastUpdated = Instant.ofEpochMilli(nextLong(0, 2000000000000)),
    archived = nextBoolean(),
    lastModifiedDate = Instant.now(),
    createdDate = Instant.now()
  )
}

fun ThreadLocalRandom.nextCinemaScreen() =
  CinemaScreenDTO("NCG${nextLong(1000, 10000000)}", "Salong ${nextInt(1, 100)}")

fun ThreadLocalRandom.nextShowing(movieId: MovieID, adminId: UserID): ShowingDTO {
  return ShowingDTO(
    id = ShowingID.random(),
    webId = Base64ID.random(),
    filmstadenShowingId = FilmstadenShowingID("AA-${nextInt(1000, 9999)}-${nextLong(1000, 1000000)}"),
    slug = "slug${nextLong()}",
    date = nextLocalDate(),
    time = nextLocalTime(),
    movieId = movieId,
    movieTitle = "rndMovieTitle${nextLong(0, 100000)}",
    location = nextLocation(),
    cinemaScreen = nextCinemaScreen(),
    price = SEK(nextLong(1000, 10000)),
    ticketsBought = nextBoolean(),
    admin = adminId,
    payToUser = adminId,
    lastModifiedDate = Instant.now(),
    createdDate = Instant.now()
  )
}

fun ThreadLocalRandom.nextAttendee(
  userId: UserID,
  showingId: ShowingID,
  ticketNumber: TicketNumber? = null
): AttendeeDTO {
  return AttendeeDTO(
    userId = userId,
    showingId = showingId,
    amountOwed = SEK(nextLong(0, 1000000)),
    hasPaid = nextBoolean(),
    type = if (ticketNumber != null) AttendeeDTO.Type.GIFT_CERTIFICATE else AttendeeDTO.Type.SWISH,
    giftCertificateUsed = if (ticketNumber != null) GiftCertificateDTO(
      userId,
      ticketNumber,
      nextLocalDate()
    ) else null
  )
}

fun ThreadLocalRandom.nextTicket(showingId: ShowingID, assignedToUser: UserID): TicketDTO {
  return TicketDTO(
    id = "id${nextLong(0, 10000000)}",
    showingId = showingId,
    assignedToUser = assignedToUser,
    profileId = "${nextString(3)}-${nextString(3)}",
    barcode = "barcode${nextLong(1000000)}",
    customerType = "customerType${nextLong(1000000)}",
    customerTypeDefinition = "ctd${nextLong(1000000)}",
    cinema = "cinema${nextLong(10000)}",
    cinemaCity = "cinemaCity${nextLong(100000)}",
    screen = "screen${nextLong(100000)}",
    seat = Seat(nextInt(0, 100), nextInt(0, 250)),
    date = nextLocalDate(),
    time = nextLocalTime(),
    movieName = "movieName${nextLong(1000000)}",
    movieRating = "${nextInt(100)} år",
    attributes = (1..10).map { "attrib${nextLong(1000)}" }.toSet()
  )
}

fun ThreadLocalRandom.nextLocalDate(): LocalDate = LocalDate.of(nextInt(1900, 2020), nextInt(1, 12), nextInt(1, 28))
fun ThreadLocalRandom.nextLocalTime(): LocalTime = LocalTime.of(nextInt(0, 23), nextInt(0, 59), nextInt(0, 59))

internal fun <ACTUAL> ObjectAssert<ACTUAL>.isRoughlyEqualToShowing(showing: ACTUAL): Any {
  return isEqualToIgnoringGivenFields(
    showing, "lastModifiedDate", "createdDate", "movieTitle", "location", "payToPhone"
  )
}
