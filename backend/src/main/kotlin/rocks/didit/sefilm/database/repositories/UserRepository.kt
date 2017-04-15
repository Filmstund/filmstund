package rocks.didit.sefilm.database.repositories

import org.springframework.data.repository.CrudRepository
import rocks.didit.sefilm.database.entities.User

interface UserRepository : CrudRepository<User, String>