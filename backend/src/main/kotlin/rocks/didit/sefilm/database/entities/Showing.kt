package rocks.didit.sefilm.database.entities

import org.springframework.data.annotation.Id
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.mongodb.core.mapping.Document
import rocks.didit.sefilm.MissingParametersException
import rocks.didit.sefilm.domain.Participant
import rocks.didit.sefilm.domain.SEK
import rocks.didit.sefilm.domain.UserID
import rocks.didit.sefilm.domain.dto.ShowingDTO
import java.time.Instant
import java.time.LocalDate
import java.time.LocalTime
import java.util.*

@Document
data class Showing(@Id
                   val id: UUID = UUID.randomUUID(),
                   val date: LocalDate? = null,
                   val time: LocalTime? = null,
                   val movieId: UUID? = null,
                   val location: Location? = null,
                   val private: Boolean = false,
                   val price: SEK? = null,
                   val ticketsBought: Boolean = false,
                   val admin: UserID = UserID(),
                   val payToUser: UserID = admin,
                   val expectedBuyDate: LocalDate? = null,
                   val participants: Set<Participant> = setOf(),
                   @LastModifiedDate
                   val lastModifiedDate: Instant = Instant.EPOCH) {
  // TODO: add more auditing

  fun toDto() = ShowingDTO(
    id = id,
    date = date ?: throw MissingParametersException("date"),
    time = time ?: throw MissingParametersException("time"),
    movieId = movieId ?: throw MissingParametersException("movieId"),
    location = location ?: throw MissingParametersException("location"),
    private = private,
    price = price,
    ticketsBought = ticketsBought,
    admin = admin,
    payToUser = payToUser,
    expectedBuyDate = expectedBuyDate,
    participants = participants.map { it.toDto() },
    lastModifiedDate = lastModifiedDate
  )
}
