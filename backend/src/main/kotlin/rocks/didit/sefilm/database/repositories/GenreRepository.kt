package rocks.didit.sefilm.database.repositories

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import rocks.didit.sefilm.database.entities.Genre

@Repository
interface GenreRepository : JpaRepository<Genre, Long> {
  fun findByGenre(genre: String): Genre?
}