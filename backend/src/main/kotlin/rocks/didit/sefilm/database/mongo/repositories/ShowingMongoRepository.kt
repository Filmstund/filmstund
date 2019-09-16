package rocks.didit.sefilm.database.mongo.repositories

import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository
import rocks.didit.sefilm.database.mongo.entities.Showing
import rocks.didit.sefilm.domain.Base64ID
import java.util.*

@Repository
@Deprecated(message = "")
interface ShowingMongoRepository : CrudRepository<Showing, UUID> {
  fun findByPrivateOrderByDateDesc(isPrivate: Boolean): List<Showing>
  fun findByMovieIdOrderByDateDesc(movieId: UUID): List<Showing>
  fun findByWebId(webId: Base64ID): Optional<Showing>
}
