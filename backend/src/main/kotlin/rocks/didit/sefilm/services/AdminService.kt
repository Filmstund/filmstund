package rocks.didit.sefilm.services

import org.springframework.stereotype.Service
import rocks.didit.sefilm.NotFoundException
import rocks.didit.sefilm.database.mongo.repositories.ShowingRepository
import rocks.didit.sefilm.domain.UserID
import rocks.didit.sefilm.domain.dto.ShowingDTO
import java.util.*

@Service
class AdminService(
  private val showingRepository: ShowingRepository,
  private val userService: UserService,
  private val assertionService: AssertionService
) {

  fun promoteToAdmin(showingId: UUID, userIdToPromote: UserID): ShowingDTO {
    val showing = showingRepository.findById(showingId)
      .orElseThrow { NotFoundException(what = "showing", showingId = showingId) }
    assertionService.assertLoggedInUserIsAdmin(showing.toDto())
    val userToPromote = userService.getCompleteUser(userIdToPromote)

    val updatedShowing = showing.copy(
      admin = userToPromote,
      payToUser = userToPromote
    )
    return showingRepository.save(updatedShowing).toDto()
  }
}