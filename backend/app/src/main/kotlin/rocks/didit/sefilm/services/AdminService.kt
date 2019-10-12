package rocks.didit.sefilm.services

import org.jdbi.v3.core.Jdbi
import org.jdbi.v3.core.kotlin.inTransactionUnchecked
import org.springframework.security.access.AccessDeniedException
import org.springframework.stereotype.Service
import rocks.didit.sefilm.currentLoggedInUser
import rocks.didit.sefilm.database.dao.ShowingDao
import rocks.didit.sefilm.domain.dto.core.ShowingDTO
import java.util.*

@Service
class AdminService(private val jdbi: Jdbi) {

  fun promoteToAdmin(showingId: UUID, userIdToPromote: UUID): ShowingDTO {
    return jdbi.inTransactionUnchecked {
      val showingDao = it.attach(ShowingDao::class.java)

      if (!showingDao.promoteNewUserToAdmin(showingId, currentLoggedInUser().id, userIdToPromote)) {
        throw AccessDeniedException("Only the showing admin is allowed to do that")
      }

      // If the showing doesn't exist, then an access denied exception will occur
      // thus we should never get null here.
      showingDao.findById(showingId)!!
    }
  }
}