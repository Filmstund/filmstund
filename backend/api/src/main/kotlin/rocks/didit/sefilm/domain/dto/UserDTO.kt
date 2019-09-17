package rocks.didit.sefilm.domain.dto

import java.time.Instant
import java.util.*

data class UserDTO(
  val id: UUID,
  val name: String? = null,
  val firstName: String? = null,
  val lastName: String? = null,
  val nick: String? = null,
  val email: String = "",
  val phone: String? = null,
  val avatar: String? = null,
  val giftCertificates: List<GiftCertificateDTO> = emptyList(),
  //val notificationSettings: NotificationSettings,
  val lastLogin: Instant = Instant.ofEpochSecond(0L),
  val signupDate: Instant = Instant.ofEpochSecond(0L),
  val calendarFeedId: UUID? = null
) {
  fun toPublicUserDTO() =
    PublicUserDTO(this.id, this.firstName, this.lastName, this.nick, this.phone, this.avatar)
}