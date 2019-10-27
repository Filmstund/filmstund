package se.filmstund.domain.dto.core

import org.jdbi.v3.core.mapper.Nested
import se.filmstund.domain.SEK
import se.filmstund.domain.id.FilmstadenMembershipId
import se.filmstund.domain.id.ShowingID
import se.filmstund.domain.id.UserID

data class AttendeeDTO(
  val userId: UserID,
  val showingId: ShowingID,
  @Nested("u")
  val userInfo: PublicUserDTO = PublicUserDTO(userId),
  val hasPaid: Boolean = false,
  val amountOwed: SEK = SEK.ZERO,
  val type: Type = Type.UNKNOWN,
  /**
   * Only relevant when type == GIFT_CERTIFICATE
   */
  val giftCertificateUsed: GiftCertificateDTO? = null,
  val filmstadenMembershipId: FilmstadenMembershipId? = null
) {
  init {
    check(!(type == Type.SWISH && giftCertificateUsed != null)) { "GiftCertificate used on Swish type. UserId=$userId, ShowingId=$showingId" }
  }

  enum class Type {
    SWISH, GIFT_CERTIFICATE, UNKNOWN
  }
}
