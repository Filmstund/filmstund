package rocks.didit.sefilm.database.entities

import java.io.Serializable
import javax.persistence.Column
import javax.persistence.Embeddable
import javax.persistence.EmbeddedId
import javax.persistence.Entity
import javax.persistence.ManyToOne
import javax.persistence.Table

@Entity
@Table
@Deprecated(message = "Don't use JPA")
class TicketAttribute(
  @EmbeddedId
  val id: TicketAttributeId
)

@Embeddable
@Deprecated(message = "Don't use JPA")
data class TicketAttributeId(
  @ManyToOne
  val ticket: Ticket,


  @Column(nullable = false)
  val attribute: String
) : Serializable {
  override fun equals(other: Any?): Boolean {
    if (this === other) return true
    if (javaClass != other?.javaClass) return false

    other as TicketAttributeId

    if (ticket.id != other.ticket.id) return false
    if (attribute != other.attribute) return false

    return true
  }

  override fun hashCode(): Int {
    var result = ticket.id.hashCode()
    result = 31 * result + attribute.hashCode()
    return result
  }

  override fun toString(): String {
    return "TicketAttributeId(ticketId=${ticket.id}, attribute='$attribute')"
  }


}
