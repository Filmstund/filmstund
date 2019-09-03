package rocks.didit.sefilm.database.mongo.repositories

import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository
import rocks.didit.sefilm.database.mongo.entities.Movie
import java.util.*

@Repository
interface MovieMongoRepository : CrudRepository<Movie, UUID> {
  fun findByArchivedOrderByPopularityDesc(archived: Boolean = false): List<Movie>
}