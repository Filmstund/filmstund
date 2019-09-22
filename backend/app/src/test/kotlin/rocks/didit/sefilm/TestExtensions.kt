package rocks.didit.sefilm

import rocks.didit.sefilm.domain.FilmstadenMembershipId
import rocks.didit.sefilm.domain.GoogleId
import rocks.didit.sefilm.domain.IMDbID
import rocks.didit.sefilm.domain.PhoneNumber
import rocks.didit.sefilm.domain.TMDbID
import rocks.didit.sefilm.domain.TicketNumber
import rocks.didit.sefilm.domain.dto.GiftCertificateDTO
import rocks.didit.sefilm.domain.dto.LocationDTO
import rocks.didit.sefilm.domain.dto.MovieDTO
import rocks.didit.sefilm.domain.dto.UserDTO
import java.math.BigDecimal
import java.time.Duration
import java.time.Instant
import java.time.LocalDate
import java.util.*
import java.util.concurrent.ThreadLocalRandom

fun ThreadLocalRandom.nextUserDTO(
  id: UUID = UUID.randomUUID(),
  giftCerts: List<GiftCertificateDTO> = emptyList()
): UserDTO {
  return UserDTO(
    id = id,
    googleId = GoogleId("gid${this.nextLong(1000L)}"),
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

fun ThreadLocalRandom.nextLocation(alias: List<String>): LocationDTO {
  val nbr = this.nextInt(100, 999)
  return LocationDTO(
    name = "locname$nbr",
    cityAlias = "${this.nextInt(10, 99)}",
    city = "city$nbr",
    streetAddress = "streetAddr$nbr",
    latitude = BigDecimal.valueOf(this.nextLong(1, 10)),
    longitude = BigDecimal.valueOf(this.nextLong(1, 10)),
    filmstadenId = "NCG$nbr",
    alias = alias,
    lastModifiedDate = Instant.EPOCH
  )
}

fun ThreadLocalRandom.nextLocationAlias(bound: Int): List<String> {
  return (0..bound).map { "alias${this.nextLong(1000)}" }
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
    releaseDate = LocalDate.of(nextInt(1900, 2020), nextInt(1, 12), nextInt(1, 28)),
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
