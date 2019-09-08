package rocks.didit.sefilm.database.repositories

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import rocks.didit.sefilm.database.entities.Location
import rocks.didit.sefilm.database.entities.LocationAlias
import java.util.*

@Repository
interface LocationRepository : JpaRepository<Location, String> {
  fun findByNameIgnoreCaseOrAliasAliasIgnoreCase(name: String, alias_alias: LocationAlias): Optional<Location>
}