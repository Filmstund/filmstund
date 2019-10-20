package se.filmstund.domain.dto

import se.filmstund.domain.PhoneNumber
import se.filmstund.domain.id.UserID

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

