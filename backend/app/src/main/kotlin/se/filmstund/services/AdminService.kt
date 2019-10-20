package se.filmstund.services

import org.jdbi.v3.core.Jdbi
import org.jdbi.v3.core.kotlin.inTransactionUnchecked
import org.springframework.security.access.AccessDeniedException
import org.springframework.stereotype.Service
import se.filmstund.currentLoggedInUser
import se.filmstund.database.dao.ShowingDao
import se.filmstund.domain.dto.core.ShowingDTO
import se.filmstund.domain.id.ShowingID
import se.filmstund.domain.id.UserID
import java.util.*

@Service
class AdminService(private val jdbi: Jdbi) {

  fun promoteToAdmin(showingId: ShowingID, userIdToPromote: UserID): ShowingDTO {
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