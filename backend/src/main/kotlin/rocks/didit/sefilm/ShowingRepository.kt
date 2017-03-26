package rocks.didit.sefilm

import org.springframework.data.repository.CrudRepository
import rocks.didit.sefilm.entities.Showing

interface ShowingRepository : CrudRepository<Showing, Long>