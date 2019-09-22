package rocks.didit.sefilm.database.dao

import org.jdbi.v3.sqlobject.customizer.BindBean
import org.jdbi.v3.sqlobject.statement.SqlBatch
import org.jdbi.v3.sqlobject.statement.SqlQuery
import rocks.didit.sefilm.domain.dto.MovieDTO
import java.util.*

interface MovieDao {
  @SqlQuery("SELECT count(1) FROM movie")
  fun count(): Int

  @SqlQuery("SELECT exists(SELECT 1 FROM movie WHERE id = :id)")
  fun existsById(id: UUID): Boolean

  @SqlQuery("SELECT * FROM movie m ORDER BY archived, popularity desc")
  fun findAll(): List<MovieDTO>

  @SqlQuery("SELECT * FROM movie WHERE id = :id")
  fun findById(id: UUID): MovieDTO?

  @SqlBatch("INSERT INTO movie (id, filmstaden_id, imdb_id, tmdb_id, slug, title, synopsis, original_title, release_date, production_year, runtime, poster, genres, popularity, popularity_last_updated, archived, last_modified_date, created_date) VALUES (:id, :filmstadenId, :imdbId, :tmdbId, :slug, :title, :synopsis, :originalTitle, :releaseDate, :productionYear, :runtime, :poster, :genres, :popularity, :popularityLastUpdated, :archived, :lastModifiedDate, :createdDate)")
  fun insertMovies(@BindBean movie: List<MovieDTO>): IntArray

  fun insertMovie(movie: MovieDTO) = insertMovies(listOf(movie))
}