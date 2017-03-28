package rocks.didit.sefilm.database.repositories

import org.springframework.data.repository.reactive.ReactiveCrudRepository
import rocks.didit.sefilm.database.entities.Showing
import java.util.*

interface ShowingRepository : ReactiveCrudRepository<Showing, UUID> {
    //fun findBioklubbnummerForShowing(@Param("showingId") showingId: UUID): Collection<Bioklubbnummer>
}