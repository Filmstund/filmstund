package rocks.didit.sefilm.database.repositories

import org.springframework.data.repository.CrudRepository
import rocks.didit.sefilm.database.entities.ParticipantInfo
import rocks.didit.sefilm.domain.UserID
import java.util.*


interface ParticipantInfoRepository : CrudRepository<ParticipantInfo, UUID> {
    fun findByUserIdIn(userIds: Collection<UserID>): Collection<ParticipantInfo>
    fun findByShowingIdAndUserId(showingId: UUID, userId: UserID): Optional<ParticipantInfo>
    fun deleteByShowingIdAndUserId(showingId: UUID, userId: UserID)
}