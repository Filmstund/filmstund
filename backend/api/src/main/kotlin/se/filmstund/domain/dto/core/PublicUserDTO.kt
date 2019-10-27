package se.filmstund.domain.dto.core

import se.filmstund.domain.Nick
import se.filmstund.domain.PhoneNumber
import se.filmstund.domain.id.UserID

data class PublicUserDTO(
  val id: UserID,
  val firstName: String? = null,
  val lastName: String? = null,
  val nick: Nick? = null,
  val phone: String? = null,
  val avatar: String? = null
) {
  constructor(
    id: UserID,
    firstName: String?,
    lastName: String?,
    nick: Nick?,
    phoneNumber: PhoneNumber?,
    avatar: String?
  ) : this(id, firstName, lastName, nick, phoneNumber?.number, avatar)

  val name: String? get() = firstName?.let { "$firstName $lastName" }
}

