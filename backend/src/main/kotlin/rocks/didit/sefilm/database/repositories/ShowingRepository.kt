package rocks.didit.sefilm.database.repositories

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import rocks.didit.sefilm.database.entities.Showing
import rocks.didit.sefilm.domain.Base64ID
import java.util.*

@Repository
interface ShowingRepository : JpaRepository<Showing, UUID> {
  //fun findByMovieIdOrderByDateDesc(movieId: UUID): List<Showing>
  fun findByWebId(webId: Base64ID): Showing?

  @Query("select s from Showing s join fetch s.movie where s.id = :id")
  fun findByIdIncludingMovie(id: UUID): Showing?
}
