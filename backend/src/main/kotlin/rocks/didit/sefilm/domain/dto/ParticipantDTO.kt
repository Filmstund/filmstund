package rocks.didit.sefilm.domain.dto

import rocks.didit.sefilm.domain.FilmstadenMembershipId
import rocks.didit.sefilm.domain.SEK
import java.util.*

class PublicParticipantDTO(
  val userId: UUID,
  val showingId: UUID,
  val userInfo: PublicUserDTO
) {
  constructor(
    userId: UUID, showingId: UUID, firstName: String?, lastName: String?, nick: String?, phone: String?, avatar: String?
  ) : this(userId, showingId, PublicUserDTO(userId, firstName, lastName, nick, phone, avatar))
}

data class ParticipantDTO(
  val userId: UUID,
  val showingId: UUID,
  val userInfo: PublicUserDTO,

  val hasPaid: Boolean = false,
  val amountOwed: SEK = SEK.ZERO,
  val type: Type = Type.UNKNOWN,
  /**
   * Only relevant when type == GIFT_CERTIFICATE
   */
  val giftCertificateUsed: GiftCertificateDTO? = null,
  val filmstadenMembershipId: FilmstadenMembershipId? = null
) {
  // This is so we can use DTO projection in JPA. It doesn't support nested classes
  constructor(
    userId: UUID,
    showingId: UUID,
    firstName: String?,
    lastName: String?,
    nick: String?,
    phone: String?,
    avatar: String?,
    hasPaid: Boolean,
    amountOwed: SEK,
    type: Type,
    giftCertificateUsed: GiftCertificateDTO?,
    filmstadenMembershipId: FilmstadenMembershipId?
  ) : this(
    userId,
    showingId,
    PublicUserDTO(userId, firstName, lastName, nick, phone, avatar),
    hasPaid,
    amountOwed,
    type,
    giftCertificateUsed,
    filmstadenMembershipId
  )

  init {
    check(!(type == Type.SWISH && giftCertificateUsed != null)) { "GiftCertificate used on Swish type. UserId=$userId, ShowingId=$showingId" }
  }

  enum class Type {
    SWISH, GIFT_CERTIFIATE, UNKNOWN
  }
}
