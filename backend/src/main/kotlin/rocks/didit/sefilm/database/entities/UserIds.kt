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

  @OneToOne(fetch = FetchType.LAZY)
  @MapsId
  var user: User,

  @Column(nullable = false, unique = true)
  @Convert(converter = UserIdConverter::class)
  val googleId: UserID,

  @Column(nullable = true, unique = true)
  @Convert(converter = FSIdConverter::class)
  val filmstadenId: FilmstadenMembershipId? = null
)