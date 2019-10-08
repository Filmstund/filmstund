package rocks.didit.sefilm.database.repositories

import org.springframework.data.jpa.repository.JpaRepository
import rocks.didit.sefilm.database.entities.Participant
import rocks.didit.sefilm.database.entities.ParticipantId
import rocks.didit.sefilm.domain.TicketNumber
import java.util.*

@Suppress("FunctionName")
@Deprecated(message = "Don't use JPA")
interface ParticipantRepository : JpaRepository<Participant, ParticipantId> {
  fun findById_Showing_Id(showingId: UUID): List<Participant>

  fun findByGiftCertificateUsed_Id_Number(number: TicketNumber): Participant?

  fun existsById_Showing_IdAndId_User_Id(showingId: UUID, userId: UUID): Boolean
}