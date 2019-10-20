package se.filmstund.database.mongo.repositories

import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository
import se.filmstund.database.mongo.entities.User
import se.filmstund.domain.id.FilmstadenMembershipId
import se.filmstund.domain.id.GoogleId
import se.filmstund.domain.id.TicketNumber
import java.util.*

@Repository
@Deprecated(message = "")
internal interface UserMongoRepository : CrudRepository<User, GoogleId> {
  fun findByIdNotIn(ids: List<GoogleId>): List<User>
  fun findByFilmstadenMembershipId(filmstadenMembershipId: FilmstadenMembershipId): User?
  fun findByCalendarFeedId(calendarFeedId: UUID): User?
  fun existsByForetagsbiljetterNumber(biljett: TicketNumber): Boolean
}
