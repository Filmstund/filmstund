package rocks.didit.sefilm.database.entities

import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.LastModifiedDate
import rocks.didit.sefilm.MissingParametersException
import rocks.didit.sefilm.database.Base64IdConverter
import rocks.didit.sefilm.database.SekConverter
import rocks.didit.sefilm.domain.Base64ID
import rocks.didit.sefilm.domain.SEK
import rocks.didit.sefilm.domain.dto.FilmstadenLiteScreenDTO
import rocks.didit.sefilm.domain.dto.core.ShowingDTO
import java.time.Instant
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime
import java.util.*
import javax.persistence.CascadeType
import javax.persistence.Convert
import javax.persistence.Entity
import javax.persistence.FetchType
import javax.persistence.Id
import javax.persistence.JoinColumn
import javax.persistence.ManyToOne
import javax.persistence.OneToMany
import javax.persistence.Table

@Entity
@Table
data class Showing(
  @Id
  val id: UUID = UUID.randomUUID(),

  @Convert(converter = Base64IdConverter::class)
  val webId: Base64ID = Base64ID.MISSING,

  val slug: String = "slug-less",
  var date: LocalDate? = null,
  var time: LocalTime? = null,

  @ManyToOne(cascade = [], optional = false, fetch = FetchType.LAZY)
  val movie: Movie = Movie(),

  @ManyToOne(cascade = [], optional = true, fetch = FetchType.LAZY)
  @JoinColumn(name = "location_id")
  var location: Location? = null,

  @ManyToOne(cascade = [CascadeType.PERSIST, CascadeType.MERGE], optional = true, fetch = FetchType.LAZY)
  var cinemaScreen: CinemaScreen? = null,

  var filmstadenShowingId: String? = null,

  @Convert(converter = SekConverter::class)
  var price: SEK = SEK.ZERO,
  var ticketsBought: Boolean = false,

  @ManyToOne(cascade = [], optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "admin")
  var admin: User,

  @ManyToOne(cascade = [], optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "pay_to_user")
  var payToUser: User = admin,

  @OneToMany(orphanRemoval = true, cascade = [CascadeType.ALL], mappedBy = "id.showing", fetch = FetchType.LAZY)
  val participants: MutableSet<Participant> = mutableSetOf(),

  @LastModifiedDate
  val lastModifiedDate: Instant = Instant.EPOCH,

  @CreatedDate
  val createdDate: Instant = Instant.now()
) {

  val dateTime: LocalDateTime
    get() = LocalDateTime.of(date, time)

  fun toDTO() = ShowingDTO(
    id = id,
    webId = webId,
    slug = slug,
    date = date ?: throw MissingParametersException("date"),
    time = time ?: throw MissingParametersException("time"),
    movieId = movie.id,
    location = location?.toDTO() ?: throw MissingParametersException("location"),
    cinemaScreen = cinemaScreen?.let { FilmstadenLiteScreenDTO(it.id, it.name) },
    price = price,
    ticketsBought = ticketsBought,
    admin = admin.id,
    payToUser = payToUser.id,
    lastModifiedDate = lastModifiedDate,
    createdDate = createdDate,
    filmstadenShowingId = filmstadenShowingId
  )
}
