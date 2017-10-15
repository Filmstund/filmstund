package rocks.didit.sefilm.database.entities

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import rocks.didit.sefilm.domain.Företagsbiljett
import rocks.didit.sefilm.domain.PhoneNumber
import rocks.didit.sefilm.domain.SfMembershipId
import rocks.didit.sefilm.domain.UserID

@Document
data class User(
  @Id
  val id: UserID = UserID("N/A"),
  val name: String? = null,
  val firstName: String? = null,
  val lastName: String? = null,
  val nick: String? = null,
  val email: String = "",
  val sfMembershipId: SfMembershipId? = null,
  val phone: PhoneNumber? = null,
  val avatar: String? = null,
  val foretagsbiljetter: List<Företagsbiljett> = emptyList()
)