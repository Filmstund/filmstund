package rocks.didit.sefilm.services

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import rocks.didit.sefilm.NotFoundException
import rocks.didit.sefilm.currentLoggedInUser
import rocks.didit.sefilm.database.entities.User
import rocks.didit.sefilm.database.repositories.ShowingRepository
import rocks.didit.sefilm.database.repositories.UserRepository
import rocks.didit.sefilm.domain.dto.core.ShowingDTO
import java.util.*

@Service
class AdminService(
  private val showingRepository: ShowingRepository,
  private val userRepo: UserRepository,
  private val assertionService: AssertionService
) {

  @Transactional
  fun promoteToAdmin(showingId: UUID, userIdToPromote: UUID): ShowingDTO {
    val showing = showingRepository.findByIdAndAdmin_Id(showingId, currentLoggedInUser().id)
      ?: throw NotFoundException(what = "showing", showingId = showingId)
    assertionService.assertLoggedInUserIsAdmin(showing.admin.id)

    val userToPromote: User = userRepo.getOne(userIdToPromote)
    showing.admin = userToPromote
    showing.payToUser = userToPromote

    return showing.toDTO()
  }
}