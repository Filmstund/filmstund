package rocks.didit.sefilm.database.repositories

import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository
import rocks.didit.sefilm.database.entities.ParticipantPaymentInfo
import rocks.didit.sefilm.domain.UserID
import java.util.*

@Repository
interface ParticipantPaymentInfoRepository : CrudRepository<ParticipantPaymentInfo, UUID> {
  fun findByShowingId(showingId: UUID): Collection<ParticipantPaymentInfo>
  fun findByShowingIdAndUserId(showingId: UUID, userId: UserID): Optional<ParticipantPaymentInfo>
  fun deleteByShowingIdAndUserId(showingId: UUID, userId: UserID)
}