package rocks.didit.sefilm.database.repositories

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import rocks.didit.sefilm.database.entities.UserIds
import rocks.didit.sefilm.domain.FilmstadenMembershipId
import rocks.didit.sefilm.domain.UserID
import java.util.*

@Repository
interface UserIdsRepository : JpaRepository<UserIds, UUID> {
  fun existsByGoogleId(googleId: UserID): Boolean
  fun findByGoogleId(googleId: UserID): UserIds?
  fun findByFilmstadenId(filmstadenMembershipId: FilmstadenMembershipId): UserIds?
}
