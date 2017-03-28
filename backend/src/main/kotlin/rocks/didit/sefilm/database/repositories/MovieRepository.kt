package rocks.didit.sefilm.database.repositories

import org.springframework.data.repository.reactive.ReactiveCrudRepository
import rocks.didit.sefilm.database.entities.Movie

interface MovieRepository : ReactiveCrudRepository<Movie, String>