package rocks.didit.sefilm.database.repositories

import org.springframework.data.repository.CrudRepository
import rocks.didit.sefilm.database.entities.Showing
import java.util.*

interface ShowingRepository : CrudRepository<Showing, UUID> {
    //fun findBioklubbnummerForShowing(@Param("showingId") showingId: UUID): Collection<Bioklubbnummer>
}