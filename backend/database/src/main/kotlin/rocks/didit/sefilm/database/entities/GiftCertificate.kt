package rocks.didit.sefilm.database.entities

import rocks.didit.sefilm.database.TicketNumberConverter
import rocks.didit.sefilm.domain.TicketNumber
import rocks.didit.sefilm.domain.dto.GiftCertificateDTO
import java.io.Serializable
import java.time.LocalDate
import javax.persistence.Column
import javax.persistence.Convert
import javax.persistence.Embeddable
import javax.persistence.EmbeddedId
import javax.persistence.Entity
import javax.persistence.ManyToOne
import javax.persistence.Table

@Embeddable
@Deprecated(message = "Don't use JPA")
data class GiftCertId(
  @ManyToOne
  var user: User,

  @Column(nullable = false, unique = true)
  @Convert(converter = TicketNumberConverter::class)
  val number: TicketNumber


) : Serializable {
  override fun equals(other: Any?): Boolean {
    if (this === other) return true
    if (javaClass != other?.javaClass) return false

    other as GiftCertId

    if (user.id != other.user.id) return false
    if (number != other.number) return false

    return true
  }

  override fun hashCode(): Int {
    var result = user.id.hashCode()
    result = 31 * result + number.hashCode()
    return result
  }

  override fun toString(): String {
    return "GiftCertId(userId=${user.id}, number=$number)"
  }


}

@Entity
@Table
@Deprecated(message = "Don't use JPA")
data class GiftCertificate(
  @EmbeddedId
  val id: GiftCertId,

  @Column(nullable = false)
  val expiresAt: LocalDate,

  @Column(nullable = false)
  val isDeleted: Boolean = false
) {
  fun toDTO() = GiftCertificateDTO(
    userId = id.user.id,
    number = id.number,
    expiresAt = expiresAt,
    status = GiftCertificateDTO.Status.UNKNOWN
  )
}