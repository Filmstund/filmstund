package se.filmstund.database.mongo.repositories

import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository
import se.filmstund.database.mongo.entities.Location
import java.util.*

@Repository
@Deprecated(message = "")
internal interface LocationMongoRepository : CrudRepository<Location, String> {
  fun findByNameIgnoreCaseOrAliasIgnoreCase(id: String, alias: String): Optional<Location>
}