package rocks.didit.sefilm.database.mongo.repositories

import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository
import rocks.didit.sefilm.database.mongo.entities.User
import rocks.didit.sefilm.domain.id.FilmstadenMembershipId
import rocks.didit.sefilm.domain.id.GoogleId
import rocks.didit.sefilm.domain.id.TicketNumber
import java.util.*

@Repository
@Deprecated(message = "")
internal interface UserMongoRepository : CrudRepository<User, GoogleId> {
  fun findByIdNotIn(ids: List<GoogleId>): List<User>
  fun findByFilmstadenMembershipId(filmstadenMembershipId: FilmstadenMembershipId): User?
  fun findByCalendarFeedId(calendarFeedId: UUID): User?
  fun existsByForetagsbiljetterNumber(biljett: TicketNumber): Boolean
}
