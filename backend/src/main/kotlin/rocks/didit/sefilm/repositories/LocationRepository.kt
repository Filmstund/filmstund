package rocks.didit.sefilm.repositories

import org.springframework.data.repository.CrudRepository
import rocks.didit.sefilm.database.entities.Location
import java.util.*

interface LocationRepository : CrudRepository<Location, UUID>