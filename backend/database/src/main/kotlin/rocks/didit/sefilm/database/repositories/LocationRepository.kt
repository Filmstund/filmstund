package rocks.didit.sefilm.database.repositories

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import rocks.didit.sefilm.database.entities.Location

@Suppress("FunctionName")
@Repository
@Deprecated(message = "Don't use JPA")
interface LocationRepository : JpaRepository<Location, String> {
  fun findByNameIgnoreCaseOrAlias_AliasIgnoreCase(name: String, alias: String): Location?
}