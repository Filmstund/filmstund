package rocks.didit.sefilm.database.entities

import rocks.didit.sefilm.database.TicketNumberConverter
import rocks.didit.sefilm.domain.TicketNumber
import java.io.Serializable
import java.time.LocalDate
import javax.persistence.*

@Embeddable
data class GiftCertId(
  @ManyToOne
  var user: User,

  @Column(nullable = false, unique = true)
  @Convert(converter = TicketNumberConverter::class)
  val number: TicketNumber
) : Serializable

@Entity
@Table
data class GiftCertificate(
  @EmbeddedId
  val id: GiftCertId,

  @Column(nullable = false)
  val expiresAt: LocalDate
)