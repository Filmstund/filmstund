package rocks.didit.sefilm.database.repositories

import org.springframework.data.repository.reactive.ReactiveCrudRepository
import rocks.didit.sefilm.database.entities.User
import java.util.*

interface UserRepository : ReactiveCrudRepository<User, UUID>