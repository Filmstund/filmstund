package rocks.didit.sefilm

import rocks.didit.sefilm.domain.FilmstadenMembershipId
import rocks.didit.sefilm.domain.TicketNumber
import rocks.didit.sefilm.domain.dto.GiftCertificateDTO
import rocks.didit.sefilm.domain.dto.UserDTO
import java.time.Instant
import java.util.*
import java.util.concurrent.ThreadLocalRandom

fun ThreadLocalRandom.nextUserDTO(
  id: UUID = UUID.randomUUID(),
  giftCerts: List<GiftCertificateDTO> = emptyList()
): UserDTO {
  return UserDTO(
    id = id,
    googleId = "gid${this.nextLong(1000L)}",
    filmstadenId = FilmstadenMembershipId("${this.nextInt(100, 999)}-${this.nextInt(100, 999)}"),
    firstName = "Fname ${this.nextLong(1000)}",
    lastName = "Lname ${this.nextLong(1000)}",
    nick = "Nickan ${this.nextLong(1000)}",
    email = "mail${this.nextLong(1000)}@example.org",
    phone = "${this.nextLong(1000000000)}",
    avatar = "http://${this.nextLong(1000)}.example.org",
    giftCertificates = giftCerts,
    lastLogin = Instant.EPOCH,
    signupDate = Instant.EPOCH,
    calendarFeedId = UUID.randomUUID()
  )
}

fun ThreadLocalRandom.nextGiftCert(userId: UUID): GiftCertificateDTO {
  return GiftCertificateDTO(userId, TicketNumber("${this.nextLong(10000000000, 99999999999)}"))
}

fun ThreadLocalRandom.nextGiftCerts(userId: UUID, bound: Int = 10): List<GiftCertificateDTO> = (0..bound).map {
  this.nextGiftCert(userId)
}
