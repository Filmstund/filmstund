package rocks.didit.sefilm.database.repositories

import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository
import rocks.didit.sefilm.database.entities.Location
import java.util.*

@Repository
interface LocationRepository : CrudRepository<Location, String> {
  fun findByNameIgnoreCaseOrAliasIgnoreCase(id: String, alias: String): Optional<Location>
}