package rocks.didit.sefilm.database.mongo.repositories

import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository
import rocks.didit.sefilm.database.mongo.entities.ParticipantPaymentInfo
import rocks.didit.sefilm.domain.UserID
import java.util.*

@Repository
@Deprecated(message = "")
internal interface ParticipantPaymentInfoMongoRepository : CrudRepository<ParticipantPaymentInfo, UUID> {
  fun findByShowingId(showingId: UUID): Collection<ParticipantPaymentInfo>
  fun findByShowingIdAndUserId(showingId: UUID, userId: UserID): Optional<ParticipantPaymentInfo>
  fun deleteByShowingIdAndUserId(showingId: UUID, userId: UserID)
}