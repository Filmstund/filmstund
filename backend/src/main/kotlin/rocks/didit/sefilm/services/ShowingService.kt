package rocks.didit.sefilm.services

import org.springframework.stereotype.Component
import rocks.didit.sefilm.currentLoggedInUser
import rocks.didit.sefilm.database.entities.Showing
import rocks.didit.sefilm.database.repositories.ShowingRepository
import rocks.didit.sefilm.domain.UserID
import java.time.LocalDate
import java.util.*

@Component
class ShowingService(private val showingRepo: ShowingRepository) {
  fun getAllPublicShowings(afterDate: LocalDate = LocalDate.MIN): List<Showing>
    = showingRepo.findByPrivate(false).toList()
    .filter { it.date?.isAfter(afterDate) ?: false }

  fun getShowing(id: UUID): Showing? = showingRepo.findById(id).orElse(null)
  fun getShowingByMovie(movieId: UUID): List<Showing> = showingRepo.findByMovieId(movieId)

  fun getPrivateShowingsForCurrentUser(afterDate: LocalDate = LocalDate.MIN): List<Showing> {
    val currentLoggedInUser = currentLoggedInUser()
    return showingRepo.findByPrivate(true)
      .filter { it.userIsInvolvedInThisShowing(currentLoggedInUser) }
  }

  private fun Showing.userIsInvolvedInThisShowing(userID: UserID): Boolean {
    return this.isAdmin(userID) || this.isParticipantInShowing(userID)
      || this.payToUser == userID
  }

  private fun Showing.isAdmin(userID: UserID): Boolean
    = this.admin == userID

  private fun Showing.isParticipantInShowing(userID: UserID): Boolean
    = this.participants.any { it.hasUserId(userID) }
}