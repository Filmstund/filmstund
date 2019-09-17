package rocks.didit.sefilm.database.entities

import org.springframework.data.annotation.LastModifiedDate
import rocks.didit.sefilm.database.FSIdConverter
import rocks.didit.sefilm.database.PhoneNumberConverter
import rocks.didit.sefilm.database.UserIdConverter
import rocks.didit.sefilm.domain.FilmstadenMembershipId
import rocks.didit.sefilm.domain.PhoneNumber
import rocks.didit.sefilm.domain.UserID
import rocks.didit.sefilm.domain.dto.PublicUserDTO
import java.time.Instant
import java.util.*
import javax.persistence.CascadeType
import javax.persistence.Column
import javax.persistence.Convert
import javax.persistence.Entity
import javax.persistence.Id
import javax.persistence.OneToMany
import javax.persistence.Table

@Entity
@Table(name = "users")
data class User(
  @Id
  val id: UUID = UUID.randomUUID(),

  @Column(nullable = false, unique = true)
  @Convert(converter = UserIdConverter::class)
  val googleId: UserID,

  @Column(nullable = true, unique = true)
  @Convert(converter = FSIdConverter::class)
  var filmstadenId: FilmstadenMembershipId? = null,

  @Column(nullable = false)
  var firstName: String,

  @Column(nullable = false)
  var lastName: String,

  @Column(nullable = false)
  var nick: String,

  @Column(nullable = false)
  val email: String = "",

  @Column(nullable = true)
  @Convert(converter = PhoneNumberConverter::class)
  var phone: PhoneNumber? = null,

  @Column(nullable = true)
  var avatar: String? = null,

  @OneToMany(orphanRemoval = true, cascade = [CascadeType.ALL], mappedBy = "id.user")
  var giftCertificates: MutableList<GiftCertificate> = mutableListOf(),

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

  fun toPublicUserDTO() =
    PublicUserDTO(this.id, this.firstName, this.lastName, this.nick, this.phone?.number, this.avatar)
}