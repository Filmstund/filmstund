package rocks.didit.sefilm.database.repositories

import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository
import rocks.didit.sefilm.database.entities.User
import rocks.didit.sefilm.domain.UserID

@Repository
interface UserRepository : CrudRepository<User, UserID>
