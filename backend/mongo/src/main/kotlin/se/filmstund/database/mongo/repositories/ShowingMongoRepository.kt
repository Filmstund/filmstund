package se.filmstund.database.mongo.repositories

import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository
import se.filmstund.database.mongo.entities.Showing
import se.filmstund.domain.id.Base64ID
import java.util.*

@Repository
@Deprecated(message = "")
internal interface ShowingMongoRepository : CrudRepository<Showing, UUID> {
  fun findByIdNotIn(ids: List<UUID>): List<Showing>
  fun findByPrivateOrderByDateDesc(isPrivate: Boolean): List<Showing>
  fun findByMovieIdOrderByDateDesc(movieId: UUID): List<Showing>
  fun findByWebId(webId: Base64ID): Optional<Showing>
}
