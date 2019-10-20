package se.filmstund.database.mongo.entities

import org.springframework.data.annotation.Id
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.mapping.Document
import se.filmstund.domain.id.FilmstadenMembershipId
import se.filmstund.domain.Foretagsbiljett
import se.filmstund.domain.id.GoogleId
import se.filmstund.domain.PhoneNumber
import java.time.Instant
import java.util.*

@Document
@Deprecated(message = "")
internal data class User(
  @Id
  val id: GoogleId = GoogleId("N/A"),
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
  //val notificationSettings: NotificationSettings = NotificationSettings(false, listOf(), listOf()),
  val lastLogin: Instant = Instant.ofEpochSecond(0L),
  val signupDate: Instant = Instant.ofEpochSecond(0L),
  @LastModifiedDate
  val lastModifiedDate: Instant = Instant.ofEpochSecond(0L)
)
