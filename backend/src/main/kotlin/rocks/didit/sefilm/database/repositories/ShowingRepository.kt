package rocks.didit.sefilm.database.repositories

import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository
import rocks.didit.sefilm.database.entities.Showing
import java.util.*

@Repository
interface ShowingRepository : CrudRepository<Showing, UUID> {
  fun findByPrivateOrderByDateDesc(isPrivate: Boolean): List<Showing>
  fun findByMovieIdOrderByDateDesc(movieId: UUID): List<Showing>
}
