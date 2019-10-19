package rocks.didit.sefilm.domain.dto

import rocks.didit.sefilm.domain.PhoneNumber
import rocks.didit.sefilm.domain.id.UserID

data class PublicUserDTO(
  val id: UserID,
  val firstName: String? = null,
  val lastName: String? = null,
  val nick: String? = null,
  val phone: String? = null,
  val avatar: String? = null
) {
  constructor(
    id: UserID,
    firstName: String?,
    lastName: String?,
    nick: String?,
    phoneNumber: PhoneNumber?,
    avatar: String?
  ) : this(id, firstName, lastName, nick, phoneNumber?.number, avatar)

  val name: String? get() = firstName?.let { "$firstName $lastName" }
}

