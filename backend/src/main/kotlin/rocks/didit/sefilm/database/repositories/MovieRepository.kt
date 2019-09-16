package rocks.didit.sefilm.database.repositories

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import rocks.didit.sefilm.database.entities.Movie
import rocks.didit.sefilm.domain.FilmstadenMembershipId
import java.util.*

@Repository
interface MovieRepository : JpaRepository<Movie, UUID> {
  fun findByArchivedOrderByPopularityDesc(archived: Boolean = false): List<Movie>

  fun existsByFilmstadenId(filmstadenId: FilmstadenMembershipId): Boolean
}
