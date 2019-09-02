package rocks.didit.sefilm.database.mongo.entities

import org.springframework.data.annotation.Id
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.mapping.Document
import rocks.didit.sefilm.domain.FilmstadenMembershipId
import rocks.didit.sefilm.domain.Foretagsbiljett
import rocks.didit.sefilm.domain.PhoneNumber
import rocks.didit.sefilm.domain.UserID
import rocks.didit.sefilm.domain.dto.LimitedUserDTO
import rocks.didit.sefilm.notification.NotificationSettings
import java.time.Instant
import java.util.*

@Document
data class User(
  @Id
  val id: UserID = UserID("N/A"),
  val name: String? = null,
  val firstName: String? = null,
  val lastName: String? = null,
  val nick: String? = null,
  val email: String = "",
  @Indexed(unique = true, sparse = true)
  val filmstadenMembershipId: FilmstadenMembershipId? = null,
  val phone: PhoneNumber? = null,
  val avatar: String? = null,
  val foretagsbiljetter: List<Foretagsbiljett> = emptyList(),
  val calendarFeedId: UUID? = UUID.randomUUID(),
  val notificationSettings: NotificationSettings = NotificationSettings(false, listOf(), listOf()),
  val lastLogin: Instant = Instant.ofEpochSecond(0L),
  val signupDate: Instant = Instant.ofEpochSecond(0L),
  @LastModifiedDate
  val lastModifiedDate: Instant = Instant.ofEpochSecond(0L)
) {
  fun toLimitedUserDTO() =
    LimitedUserDTO(this.id, this.name, this.firstName, this.lastName, this.nick, this.phone?.number, this.avatar)
}