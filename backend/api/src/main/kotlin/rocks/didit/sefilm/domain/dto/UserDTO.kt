package rocks.didit.sefilm.domain.dto

import rocks.didit.sefilm.domain.FilmstadenMembershipId
import java.time.Instant
import java.util.*

data class UserDTO(
  val id: UUID,
  val googleId: String? = null,
  val filmstadenId: FilmstadenMembershipId? = null,
  val firstName: String = "",
  val lastName: String = "",
  val nick: String = "",
  val email: String = "",
  val phone: String? = null,
  val avatar: String? = null,
  val giftCertificates: List<GiftCertificateDTO> = emptyList(),
  //val notificationSettings: NotificationSettings,
  val lastLogin: Instant = Instant.ofEpochSecond(0L),
  val signupDate: Instant = Instant.ofEpochSecond(0L),
  val calendarFeedId: UUID? = null
) {
  val name: String get() = "$firstName $lastName"
  fun toPublicUserDTO() =
    PublicUserDTO(this.id, this.firstName, this.lastName, this.nick, this.phone, this.avatar)
}