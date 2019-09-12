package rocks.didit.sefilm.database.entities

import org.springframework.data.annotation.LastModifiedDate
import rocks.didit.sefilm.database.PhoneNumberConverter
import rocks.didit.sefilm.domain.PhoneNumber
import java.time.Instant
import java.util.*
import javax.persistence.*

@Entity
@Table(name = "users")
data class User(
  @Id
  val id: UUID = UUID.randomUUID(),

  @Column(nullable = false)
  var firstName: String,

  @Column(nullable = false)
  var lastName: String,

  @Column(nullable = false)
  val nick: String,

  @Column(nullable = false)
  val email: String = "",

  @Column(nullable = true)
  @Convert(converter = PhoneNumberConverter::class)
  val phone: PhoneNumber? = null,

  @Column(nullable = true)
  var avatar: String? = null,

  @OneToMany(orphanRemoval = true, cascade = [CascadeType.ALL], mappedBy = "id.user")
  var giftCertificates: List<GiftCertificate> = mutableListOf(),

  @Column(nullable = true)
  val calendarFeedId: UUID? = UUID.randomUUID(),

  //@Column(nullable = false)
  //val notificationSettings: NotificationSettings = NotificationSettings(false, listOf(), listOf()),

  @Column(nullable = false)
  var lastLogin: Instant = Instant.ofEpochSecond(0L),

  @Column(nullable = false)
  val signupDate: Instant = Instant.ofEpochSecond(0L),

  @LastModifiedDate
  @Column(nullable = false)
  val lastModifiedDate: Instant = Instant.ofEpochSecond(0L)
) {
  val name: String get() = "$firstName $lastName"
  //fun toLimitedUserDTO() =
  //LimitedUserDTO(this.id, this.name, this.firstName, this.lastName, this.nick, this.phone?.number, this.avatar)
}