package se.filmstund.database.mongo.repositories

import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository
import se.filmstund.database.mongo.entities.ParticipantPaymentInfo
import se.filmstund.domain.id.GoogleId
import java.util.*

@Repository
@Deprecated(message = "")
internal interface ParticipantPaymentInfoMongoRepository : CrudRepository<ParticipantPaymentInfo, UUID> {
  fun findByShowingId(showingId: UUID): Collection<ParticipantPaymentInfo>
  fun findByShowingIdAndUserId(showingId: UUID, userId: GoogleId): Optional<ParticipantPaymentInfo>
  fun deleteByShowingIdAndUserId(showingId: UUID, userId: GoogleId)
}