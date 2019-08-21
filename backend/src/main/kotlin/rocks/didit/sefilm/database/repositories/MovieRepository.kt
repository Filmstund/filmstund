package rocks.didit.sefilm.database.repositories

import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository
import rocks.didit.sefilm.database.entities.Movie
import java.util.*

@Repository
interface MovieRepository : CrudRepository<Movie, UUID> {
    fun findByArchivedOrderByPopularityDesc(archived: Boolean = false): List<Movie>
}