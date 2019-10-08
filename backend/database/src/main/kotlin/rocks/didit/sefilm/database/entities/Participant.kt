package rocks.didit.sefilm.database.entities

import org.hibernate.annotations.JoinColumnOrFormula
import org.hibernate.annotations.JoinColumnsOrFormulas
import org.hibernate.annotations.JoinFormula
import rocks.didit.sefilm.domain.SEK
import rocks.didit.sefilm.domain.dto.core.ParticipantDTO
import rocks.didit.sefilm.domain.dto.core.PublicParticipantDTO
import java.io.Serializable
import javax.persistence.Column
import javax.persistence.Embeddable
import javax.persistence.EmbeddedId
import javax.persistence.Entity
import javax.persistence.EnumType
import javax.persistence.Enumerated
import javax.persistence.JoinColumn
import javax.persistence.ManyToOne
import javax.persistence.OneToOne
import javax.persistence.Table

@Embeddable
@Deprecated(message = "Don't use JPA")
data class ParticipantId(
  @ManyToOne(optional = false, cascade = [])
  val user: User,

  @ManyToOne(optional = false, cascade = [])
  val showing: Showing


) : Serializable {
  override fun equals(other: Any?): Boolean {
    if (this === other) return true
    if (javaClass != other?.javaClass) return false

    other as ParticipantId

    if (user.id != other.user.id) return false
    if (showing.id != other.showing.id) return false

    return true
  }

  override fun hashCode(): Int {
    var result = user.id.hashCode()
    result = 31 * result + showing.id.hashCode()
    return result
  }

  override fun toString(): String {
    return "ParticipantId(userId=${user.id}, showingId=${showing.id})"
  }
}

@Entity
@Table
@Deprecated(message = "Don't use JPA")
data class Participant(
  @EmbeddedId
  val id: ParticipantId,

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  val participantType: Type = Type.SWISH,

  @Column(nullable = false)
  var hasPaid: Boolean = false,

  @OneToOne(optional = true, cascade = [])
  @JoinColumnsOrFormulas(
    JoinColumnOrFormula(column = JoinColumn(name = "gift_certificate_used")),
    JoinColumnOrFormula(formula = JoinFormula(value = "user_id"))
  )
  val giftCertificateUsed: GiftCertificate? = null
) {
  val user: User get() = id.user
  val showing: Showing get() = id.showing

  enum class PropertyKey

  enum class Type {
    SWISH, GIFT_CERTIFICATE
  }

  fun toDTO() = ParticipantDTO(
    userId = user.id,
    showingId = showing.id,
    userInfo = user.toPublicUserDTO(),
    hasPaid = hasPaid,
    amountOwed = when (hasPaid) {
      true -> SEK.ZERO
      false -> showing.price
    },
    type = when (participantType) {
      Type.SWISH -> ParticipantDTO.Type.SWISH
      Type.GIFT_CERTIFICATE -> ParticipantDTO.Type.GIFT_CERTIFICATE
    },
    giftCertificateUsed = giftCertificateUsed?.toDTO(),
    filmstadenMembershipId = user.filmstadenId
  )

  fun toPublicDTO() = PublicParticipantDTO(
    userId = user.id,
    showingId = showing.id,
    userInfo = user.toPublicUserDTO()
  )
}
