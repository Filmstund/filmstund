package rocks.didit.sefilm.database.entities

import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.LastModifiedDate
import rocks.didit.sefilm.database.Base64IdConverter
import rocks.didit.sefilm.database.SekConverter
import rocks.didit.sefilm.domain.Base64ID
import rocks.didit.sefilm.domain.SEK
import java.time.Instant
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime
import java.util.*
import javax.persistence.*

@Entity
@Table
data class Showing(
  @Id
  val id: UUID = UUID.randomUUID(),

  @Convert(converter = Base64IdConverter::class)
  val webId: Base64ID = Base64ID.MISSING,

  val slug: String = "slug-less",
  val date: LocalDate? = null,
  val time: LocalTime? = null,

  @ManyToOne(cascade = [], optional = false, fetch = FetchType.LAZY)
  val movie: Movie = Movie(),

  @ManyToOne(cascade = [], optional = true, fetch = FetchType.LAZY)
  @JoinColumn(name = "location_id")
  val location: Location? = null,

  @ManyToOne(cascade = [CascadeType.PERSIST, CascadeType.MERGE], optional = true)
  val cinemaScreen: CinemaScreen? = null,

  val filmstadenShowingId: String? = null,

  @Convert(converter = SekConverter::class)
  val price: SEK = SEK.ZERO,
  val ticketsBought: Boolean = false,

  @ManyToOne(cascade = [], optional = false)
  @JoinColumn(name = "admin")
  val admin: User,

  @ManyToOne(cascade = [], optional = false)
  @JoinColumn(name = "pay_to_user")
  val payToUser: User = admin,

  @OneToMany(orphanRemoval = true, cascade = [CascadeType.ALL], mappedBy = "id.showing")
  val participants: MutableSet<Participant> = mutableSetOf(),

  @LastModifiedDate
  val lastModifiedDate: Instant = Instant.EPOCH,

  @CreatedDate
  val createdDate: Instant = Instant.now()
) {

  val dateTime: LocalDateTime
    get() = LocalDateTime.of(date, time)

  //fun toDto() = ShowingDTO(
  //  id = id,
  //  webId = webId,
  //  slug = slug,
  //  date = date ?: throw MissingParametersException("date"),
  //  time = time ?: throw MissingParametersException("time"),
  //  movieId = movie.id,
  //  location = location ?: throw MissingParametersException("location"),
  //  filmstadenScreen = filmstadenScreen,
  //  private = private,
  //  price = price,
  //  ticketsBought = ticketsBought,
  //  admin = admin.id,
  //  payToUser = payToUser.id,
  //  expectedBuyDate = expectedBuyDate,
  //  participants = participants.map { it.toDto() },
  //  lastModifiedDate = lastModifiedDate,
  //  createdDate = createdDate,
  //  filmstadenRemoteEntityId = filmstadenRemoteEntityId
  //)
}
