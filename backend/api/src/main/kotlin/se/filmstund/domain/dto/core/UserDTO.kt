package se.filmstund.domain.dto.core

import se.filmstund.domain.PhoneNumber
import se.filmstund.domain.dto.GiftCertificateDTO
import se.filmstund.domain.dto.PublicUserDTO
import se.filmstund.domain.id.CalendarFeedID
import se.filmstund.domain.id.FilmstadenMembershipId
import se.filmstund.domain.id.GoogleId
import se.filmstund.domain.id.UserID
import java.time.Instant

data class UserDTO(
  val id: UserID,
  val googleId: GoogleId? = null,
  val filmstadenMembershipId: FilmstadenMembershipId? = null,
  val calendarFeedId: CalendarFeedID? = null,
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