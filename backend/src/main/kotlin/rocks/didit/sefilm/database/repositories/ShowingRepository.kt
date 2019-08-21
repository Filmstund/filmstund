package rocks.didit.sefilm.database.repositories

import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository
import rocks.didit.sefilm.database.entities.Showing
import rocks.didit.sefilm.domain.Base64ID
import java.util.*

@Repository
interface ShowingRepository : CrudRepository<Showing, UUID> {
    fun findByPrivateOrderByDateDesc(isPrivate: Boolean): List<Showing>
    fun findByMovieIdOrderByDateDesc(movieId: UUID): List<Showing>
    fun findByWebId(webId: Base64ID): Optional<Showing>
}
