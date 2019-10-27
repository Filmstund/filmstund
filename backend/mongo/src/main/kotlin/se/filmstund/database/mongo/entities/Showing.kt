package se.filmstund.database.mongo.entities

import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.Id
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.mongodb.core.mapping.DBRef
import org.springframework.data.mongodb.core.mapping.Document
import rocks.didit.sefilm.domain.Participant
import se.filmstund.domain.SEK
import se.filmstund.domain.dto.FilmstadenLiteScreenDTO
import se.filmstund.domain.id.Base64ID
import java.time.Instant
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime
import java.util.*

@Document
@Deprecated(message = "")
internal data class Showing(
  @Id
  val id: UUID = UUID.randomUUID(),
  val webId: Base64ID = Base64ID.MISSING,
  val slug: String = "slug-less",
  val date: LocalDate? = null,
  val time: LocalTime? = null,
  @DBRef
  val movie: Movie = Movie(),
  val location: Location? = null,
  val filmstadenScreen: FilmstadenLiteScreenDTO? = null,
  val private: Boolean = false,
  val price: SEK? = null,
  val ticketsBought: Boolean = false,
  @DBRef
  val admin: User = User(),
  @DBRef
  val payToUser: User = admin,
  val expectedBuyDate: LocalDate? = null,
  val participants: Set<Participant> = setOf(),
  @LastModifiedDate
  val lastModifiedDate: Instant = Instant.EPOCH,
  @CreatedDate
  val createdDate: Instant = Instant.now(),
  val filmstadenRemoteEntityId: String? = null
) {

  val dateTime: LocalDateTime
    get() = LocalDateTime.of(date, time)
}