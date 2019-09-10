package rocks.didit.sefilm.database.entities

import org.hibernate.annotations.NaturalId
import javax.persistence.*

@Entity
@Table
data class Genre(
  @Id
  @GeneratedValue(generator = "genre_id_seq")
  val id: Long? = null,

  @Column(nullable = false, length = 100)
  @NaturalId
  val genre: String,

  @ManyToMany(mappedBy = "genres")
  val movies: MutableSet<Movie> = mutableSetOf()


) {
  override fun equals(other: Any?): Boolean {
    if (this === other) return true
    if (javaClass != other?.javaClass) return false

    other as Genre
    if (genre != other.genre) return false
    return true
  }

  override fun hashCode(): Int {
    return genre.hashCode()
  }

  override fun toString(): String {
    return "Genre(id=$id, genre='$genre', movieCount=${movies.size})"
  }


}