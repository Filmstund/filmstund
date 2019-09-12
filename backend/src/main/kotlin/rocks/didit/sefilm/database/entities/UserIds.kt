package rocks.didit.sefilm.database.entities

import rocks.didit.sefilm.database.FSIdConverter
import rocks.didit.sefilm.database.UserIdConverter
import rocks.didit.sefilm.domain.FilmstadenMembershipId
import rocks.didit.sefilm.domain.UserID
import java.util.*
import javax.persistence.*

/**
 * This entity maps a user to different "external" user ids. I.e. google id, filmstaden id etc.
 */
@Entity
@Table(name = "user_ids")
data class UserIds(
  /** this is actually the user id */
  @Id
  val id: UUID,

  @OneToOne(fetch = FetchType.LAZY, optional = false, cascade = [CascadeType.ALL])
  @MapsId
  var user: User,

  @Column(nullable = false, unique = true)
  @Convert(converter = UserIdConverter::class)
  val googleId: UserID,

  @Column(nullable = true, unique = true)
  @Convert(converter = FSIdConverter::class)
  val filmstadenId: FilmstadenMembershipId? = null
) {
  override fun equals(other: Any?): Boolean {
    if (this === other) return true
    if (javaClass != other?.javaClass) return false

    other as UserIds

    if (id != other.id) return false
    if (user.id != other.user.id) return false
    if (googleId != other.googleId) return false
    if (filmstadenId != other.filmstadenId) return false

    return true
  }

  override fun hashCode(): Int {
    var result = id.hashCode()
    result = 31 * result + user.id.hashCode()
    result = 31 * result + googleId.hashCode()
    result = 31 * result + (filmstadenId?.hashCode() ?: 0)
    return result
  }

  override fun toString(): String {
    return "UserIds(id=$id, googleId=$googleId, filmstadenId=$filmstadenId)"
  }


}