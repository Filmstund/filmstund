package rocks.didit.sefilm.database.mongo.repositories

import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository
import rocks.didit.sefilm.database.mongo.entities.Location
import java.util.*

@Repository
interface LocationMongoRepository : CrudRepository<Location, String> {
  fun findByNameIgnoreCaseOrAliasIgnoreCase(id: String, alias: String): Optional<Location>
}