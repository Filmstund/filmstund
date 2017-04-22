package rocks.didit.sefilm.database.repositories

import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository
import rocks.didit.sefilm.database.entities.Showing
import java.util.*

@Repository
interface ShowingRepository : CrudRepository<Showing, UUID>
