package rocks.didit.sefilm.database.entities

import org.springframework.data.annotation.LastModifiedDate
import java.time.Instant
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.Id
import javax.persistence.Table

@Entity
@Table
data class LocationAlias(
  @Id
  @Column(nullable = false, unique = true)
  val alias: String = "",

  @LastModifiedDate
  @Column(nullable = false)
  val lastModifiedDate: Instant = Instant.now()
)
