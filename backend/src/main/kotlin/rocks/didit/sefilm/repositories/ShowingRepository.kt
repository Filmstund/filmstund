package rocks.didit.sefilm.repositories

import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository
import org.springframework.data.repository.query.Param
import rocks.didit.sefilm.database.entities.Showing
import rocks.didit.sefilm.domain.Bioklubbnummer
import java.util.*

interface ShowingRepository : CrudRepository<Showing, UUID> {
    @Query(value = "SELECT ps.bioklubbnummer " +
            "FROM Showing s LEFT JOIN s.participants ps " +
            "WHERE s.id = :showingId")
    fun findBioklubbnummerForShowing(@Param("showingId") showingId: UUID): Collection<Bioklubbnummer>
}