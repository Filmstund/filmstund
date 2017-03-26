package rocks.didit.sefilm.repositories

import org.springframework.data.repository.CrudRepository
import rocks.didit.sefilm.database.entities.User
import java.util.*

interface UserRepository : CrudRepository<User, UUID>