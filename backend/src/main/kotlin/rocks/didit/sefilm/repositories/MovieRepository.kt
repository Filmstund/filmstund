package rocks.didit.sefilm.repositories

import org.springframework.data.repository.CrudRepository
import rocks.didit.sefilm.database.entities.Movie
import java.util.*

interface MovieRepository : CrudRepository<Movie, UUID>