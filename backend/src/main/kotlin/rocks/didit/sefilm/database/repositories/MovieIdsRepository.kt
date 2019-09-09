package rocks.didit.sefilm.database.repositories

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import rocks.didit.sefilm.database.entities.MovieIds
import java.util.*

@Repository
interface MovieIdsRepository : JpaRepository<MovieIds, UUID> {
}