package rocks.didit.sefilm.database.repositories

import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository
import rocks.didit.sefilm.database.entities.User
import rocks.didit.sefilm.domain.Bioklubbnummer

@Repository
interface UserRepository : CrudRepository<User, String> {
    fun findByIdIn(ids: Collection<String>): List<Bioklubbnummer>
}