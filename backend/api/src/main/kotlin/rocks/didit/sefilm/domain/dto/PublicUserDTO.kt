package rocks.didit.sefilm.domain.dto

import rocks.didit.sefilm.domain.PhoneNumber
import java.util.*

data class PublicUserDTO(
  val id: UUID,
  val firstName: String? = null,
  val lastName: String? = null,
  val nick: String? = null,
  val phone: String? = null,
  val avatar: String? = null
) {
  constructor(
    id: UUID,
    firstName: String?,
    lastName: String?,
    nick: String?,
    phoneNumber: PhoneNumber?,
    avatar: String?
  ) : this(id, firstName, lastName, nick, phoneNumber?.number, avatar)

  val name: String? get() = firstName?.let { "$firstName $lastName" }
}

