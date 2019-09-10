package rocks.didit.sefilm.database.entities

import org.hibernate.annotations.JoinColumnOrFormula
import org.hibernate.annotations.JoinColumnsOrFormulas
import org.hibernate.annotations.JoinFormula
import rocks.didit.sefilm.database.SekConverter
import rocks.didit.sefilm.domain.SEK
import java.io.Serializable
import javax.persistence.*

@Embeddable
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
data class Participant(
  @EmbeddedId
  val id: ParticipantId,

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  val participantType: Type = Type.SWISH,

  @Column(nullable = false)
  val hasPaid: Boolean = false,

  @Column(nullable = false)
  @Convert(converter = SekConverter::class)
  val amountOwed: SEK = SEK.ZERO,

  @OneToOne(optional = true, cascade = [])
  @JoinColumnsOrFormulas(
    JoinColumnOrFormula(column = JoinColumn(name = "gift_certificate_used")),
    JoinColumnOrFormula(formula = JoinFormula(value = "user_id"))
  )
  val giftCertificateUsed: GiftCertificate? = null,

  @ElementCollection
  @MapKeyColumn(name = "key")
  @MapKeyEnumerated(EnumType.STRING)
  @Column(name = "value")
  @CollectionTable(
    name = "participant_properties",
    joinColumns = [JoinColumn(name = "showing_id"), JoinColumn(name = "user_id")]
  )
  val properties: Map<PropertyKey, String> = mutableMapOf()

) {
  val user: User get() = id.user
  val showing: Showing get() = id.showing

  enum class PropertyKey {
  }

  enum class Type {
    SWISH, GIFT_CERTIFICATE
  }
}
