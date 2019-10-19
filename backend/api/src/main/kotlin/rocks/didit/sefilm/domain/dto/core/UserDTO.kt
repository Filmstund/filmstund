package rocks.didit.sefilm.domain.dto.core

import rocks.didit.sefilm.domain.PhoneNumber
import rocks.didit.sefilm.domain.dto.GiftCertificateDTO
import rocks.didit.sefilm.domain.dto.PublicUserDTO
import rocks.didit.sefilm.domain.id.FilmstadenMembershipId
import rocks.didit.sefilm.domain.id.GoogleId
import rocks.didit.sefilm.domain.id.UserID
import java.time.Instant
import java.util.*

data class UserDTO(
  val id: UserID,
  val googleId: GoogleId? = null,
  // TODO rename
  val filmstadenId: FilmstadenMembershipId? = null,
  // TODO: add domain object
  val calendarFeedId: UUID? = null,
  val firstName: String = "",
  val lastName: String = "",
  val nick: String = "",
  val email: String = "",
  val phone: PhoneNumber? = null,
  val avatar: String? = null,
  val giftCertificates: List<GiftCertificateDTO> = emptyList(),
  //val notificationSettings: NotificationSettings,
  val lastLogin: Instant = Instant.EPOCH,
  val signupDate: Instant = Instant.EPOCH,
  val lastModifiedDate: Instant = Instant.now()
) {
  val name: String get() = "$firstName $lastName"
  fun toPublicUserDTO() =
    PublicUserDTO(
      this.id,
      this.firstName,
      this.lastName,
      this.nick,
      this.phone,
      this.avatar
    )
}