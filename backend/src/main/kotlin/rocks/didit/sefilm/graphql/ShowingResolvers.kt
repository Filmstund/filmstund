package rocks.didit.sefilm.graphql

import com.coxautodev.graphql.tools.GraphQLQueryResolver
import com.coxautodev.graphql.tools.GraphQLResolver
import org.springframework.stereotype.Component
import rocks.didit.sefilm.NotFoundException
import rocks.didit.sefilm.database.entities.Movie
import rocks.didit.sefilm.database.entities.Showing
import rocks.didit.sefilm.domain.Participant
import rocks.didit.sefilm.domain.PaymentType
import rocks.didit.sefilm.domain.dto.LimitedUserDTO
import rocks.didit.sefilm.redact
import rocks.didit.sefilm.services.MovieService
import rocks.didit.sefilm.services.ShowingService
import rocks.didit.sefilm.services.UserService
import java.time.LocalDate
import java.util.*

@Component
class ShowingQueryResolver(private val showingService: ShowingService) : GraphQLQueryResolver {
  fun publicShowings(afterDate: LocalDate?) = showingService.getAllPublicShowings(afterDate ?: LocalDate.MIN)
  fun privateShowingsForCurrentUser(afterDate: LocalDate?) = showingService.getPrivateShowingsForCurrentUser(afterDate ?: LocalDate.MIN)
  fun showing(id: UUID): Showing? = showingService.getShowing(id)
  fun showingForMovie(movieId: UUID) = showingService.getShowingByMovie(movieId)
}

@Component
class ShowingResolver(private val userService: UserService,
                      private val movieService: MovieService) : GraphQLResolver<Showing> {
  fun admin(showing: Showing): LimitedUserDTO = userService.getUser(showing.admin).orElseThrow { NotFoundException("admin user with id: ${showing.admin}") }
  fun payToUser(showing: Showing): LimitedUserDTO = userService.getUser(showing.payToUser).orElseThrow { NotFoundException("payToUser with id: ${showing.payToUser}") }
  fun movie(showing: Showing): Movie {
    val id = showing.movieId ?: UUID.randomUUID()
    return movieService.getMovie(id)
      .orElseThrow { NotFoundException("movie with id: ${showing.movieId}") }
  }
}

@Component
class ParticipantUserResolver(private val userService: UserService) : GraphQLResolver<Participant> {
  fun user(participant: Participant): LimitedUserDTO
    = userService
    .getUser(participant.extractUserId())
    .orElseThrow { NotFoundException("user with id: ${participant.extractUserId()}") }

  fun paymentType(participant: Participant): PaymentType = participant.redact().paymentType
}
