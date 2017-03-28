package rocks.didit.sefilm.database.repositories

import org.springframework.data.repository.reactive.ReactiveCrudRepository
import rocks.didit.sefilm.database.entities.Location
import java.util.*

interface LocationRepository : ReactiveCrudRepository<Location, UUID>