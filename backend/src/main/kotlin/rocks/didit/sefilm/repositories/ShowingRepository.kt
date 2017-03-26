package rocks.didit.sefilm.repositories

import org.springframework.data.repository.CrudRepository
import rocks.didit.sefilm.database.entities.Showing
import java.util.*

interface ShowingRepository : CrudRepository<Showing, UUID>