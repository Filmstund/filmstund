package rocks.didit.sefilm

import rocks.didit.sefilm.domain.Base64ID
import rocks.didit.sefilm.domain.FilmstadenMembershipId
import rocks.didit.sefilm.domain.GoogleId
import rocks.didit.sefilm.domain.IMDbID
import rocks.didit.sefilm.domain.PhoneNumber
import rocks.didit.sefilm.domain.SEK
import rocks.didit.sefilm.domain.TMDbID
import rocks.didit.sefilm.domain.TicketNumber
import rocks.didit.sefilm.domain.dto.FilmstadenLiteScreenDTO
import rocks.didit.sefilm.domain.dto.GiftCertificateDTO
import rocks.didit.sefilm.domain.dto.core.LocationDTO
import rocks.didit.sefilm.domain.dto.core.MovieDTO
import rocks.didit.sefilm.domain.dto.core.ParticipantDTO
import rocks.didit.sefilm.domain.dto.core.ShowingDTO
import rocks.didit.sefilm.domain.dto.core.TicketDTO
import rocks.didit.sefilm.domain.dto.core.UserDTO
import java.math.BigDecimal
import java.time.Duration
import java.time.Instant
import java.time.LocalDate
import java.time.LocalTime
import java.util.*
import java.util.concurrent.ThreadLocalRandom

fun ThreadLocalRandom.nextUserDTO(
  id: UUID = UUID.randomUUID(),
  giftCerts: List<GiftCertificateDTO> = emptyList()
): UserDTO {
  return UserDTO(
    id = id,
    googleId = GoogleId("gid${this.nextLong(100000L)}"),
    filmstadenId = FilmstadenMembershipId("${this.nextInt(100, 999)}-${this.nextInt(100, 999)}"),
    calendarFeedId = UUID.randomUUID(),
    firstName = "Fname ${this.nextLong(1000)}",
    lastName = "Lname ${this.nextLong(1000)}",
    nick = "Nickan ${this.nextLong(1000)}",
    email = "mail${this.nextLong(1000)}@example.org",
    phone = PhoneNumber("073000000${this.nextLong(0, 9)}"),
    avatar = "http://${this.nextLong(1000)}.example.org",
    giftCertificates = giftCerts,
    lastLogin = Instant.EPOCH,
    signupDate = Instant.EPOCH,
    lastModifiedDate = Instant.EPOCH
  )
}

fun ThreadLocalRandom.nextGiftCert(userId: UUID): GiftCertificateDTO {
  return GiftCertificateDTO(userId, TicketNumber("${this.nextLong(10000000000, 99999999999)}"))
}

fun ThreadLocalRandom.nextGiftCerts(userId: UUID, bound: Int = 10): List<GiftCertificateDTO> = (0..bound).map {
  this.nextGiftCert(userId)
}

fun ThreadLocalRandom.nextLocation(alias: List<String> = nextLocationAlias(3)): LocationDTO {
  val nbr = this.nextInt(100, 999)
  return LocationDTO(
    name = "locname$nbr",
    cityAlias = "${this.nextInt(10, 99)}",
    city = "city$nbr",
    streetAddress = "streetAddr$nbr",
    postalAddress = "postalAddr${nextLong()}",
    postalCode = "${nextLong(1000, 10000)}",
    latitude = BigDecimal.valueOf(this.nextLong(1, 10)),
    longitude = BigDecimal.valueOf(this.nextLong(1, 10)),
    filmstadenId = "NCG$nbr",
    alias = alias,
    lastModifiedDate = Instant.EPOCH
  )
}

fun ThreadLocalRandom.nextLocationAlias(bound: Int): List<String> {
  return (0..bound).map { "alias${this.nextLong(100000)}" }
}

fun ThreadLocalRandom.nextMovie(genreBound: Int = 5): MovieDTO {
  return MovieDTO(
    id = UUID.randomUUID(),
    filmstadenId = "fsid${nextLong(1000)}",
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
  FilmstadenLiteScreenDTO("NCG${nextLong(1000, 10000000)}", "Salong ${nextInt(1, 100)}")

fun ThreadLocalRandom.nextShowing(movieId: UUID, adminId: UUID): ShowingDTO {
  return ShowingDTO(
    id = UUID.randomUUID(),
    webId = Base64ID.random(),
    filmstadenShowingId = "AA-${nextInt(1000, 9999)}-${nextLong(1000, 1000000)}",
    slug = "slug${nextLong()}",
    date = nextLocalDate(),
    time = nextLocalTime(),
    movieId = movieId,
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

fun ThreadLocalRandom.nextParticipant(
  userId: UUID,
  showingId: UUID,
  ticketNumber: TicketNumber? = null
): ParticipantDTO {
  return ParticipantDTO(
    userId = userId,
    showingId = showingId,
    amountOwed = SEK(nextLong(0, 1000000)),
    hasPaid = nextBoolean(),
    type = if (ticketNumber != null) ParticipantDTO.Type.GIFT_CERTIFICATE else ParticipantDTO.Type.SWISH,
    giftCertificateUsed = if (ticketNumber != null) GiftCertificateDTO(
      userId,
      ticketNumber,
      nextLocalDate()
    ) else null
  )
}

fun ThreadLocalRandom.nextTicket(showingId: UUID, assignedToUser: UUID): TicketDTO {
  return TicketDTO(
    id = "id${nextLong(0, 10000000)}",
    showingId = showingId,
    assignedToUser = assignedToUser,
    profileId = "pid${nextLong(1000)}",
    barcode = "barcode${nextLong(1000000)}",
    customerType = "customerType${nextLong(1000000)}",
    customerTypeDefinition = "ctd${nextLong(1000000)}",
    cinema = "cinema${nextLong(10000)}",
    cinemaCity = "cinemaCity${nextLong(100000)}",
    screen = "screen${nextLong(100000)}",
    seatRow = nextInt(0, 100),
    seatNumber = nextInt(0, 250),
    date = nextLocalDate(),
    time = nextLocalTime(),
    movieName = "movieName${nextLong(1000000)}",
    movieRating = "${nextInt(100)} år",
    attributes = (1..10).map { "attrib${nextLong(1000)}" }.toSet()
  )
}

fun ThreadLocalRandom.nextLocalDate() = LocalDate.of(nextInt(1900, 2020), nextInt(1, 12), nextInt(1, 28))
fun ThreadLocalRandom.nextLocalTime() = LocalTime.of(nextInt(0, 23), nextInt(0, 59), nextInt(0, 59))
