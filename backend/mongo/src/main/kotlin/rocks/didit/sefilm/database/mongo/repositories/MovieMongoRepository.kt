package rocks.didit.sefilm.database.mongo.repositories

import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository
import rocks.didit.sefilm.database.mongo.entities.Movie
import java.util.*

@Repository
@Deprecated(message = "")
internal interface MovieMongoRepository : CrudRepository<Movie, UUID> {
  fun findByIdNotIn(ids: List<UUID>): List<Movie>
  fun findByArchivedOrderByPopularityDesc(archived: Boolean = false): List<Movie>
}