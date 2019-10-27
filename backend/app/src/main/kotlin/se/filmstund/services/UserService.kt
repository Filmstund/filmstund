package se.filmstund.services

import org.jdbi.v3.core.Jdbi
import org.jdbi.v3.core.kotlin.inTransactionUnchecked
import org.springframework.security.access.AccessDeniedException
import org.springframework.stereotype.Service
import se.filmstund.NotFoundException
import se.filmstund.currentLoggedInUser
import se.filmstund.database.dao.UserDao
import se.filmstund.domain.Nick
import se.filmstund.domain.dto.core.PublicUserDTO
import se.filmstund.domain.dto.core.UserDTO
import se.filmstund.domain.dto.input.UserDetailsDTO
import se.filmstund.domain.id.UserID
import se.filmstund.logger
import se.filmstund.maybeCurrentLoggedInUser
import java.time.Instant
import java.util.*

@Service
class UserService(
  private val jdbi: Jdbi,
  private val userDao: UserDao,
  private val giftCertificateService: GiftCertificateService
) {

  private val log by logger()

  fun allUsers(): List<PublicUserDTO> = userDao.findAllPublicUsers()
  fun getUser(id: UserID): PublicUserDTO? = userDao.findPublicUserById(id)
  fun getUserOrThrow(id: UserID): PublicUserDTO = getUser(id)
    ?: throw NotFoundException("user", id)

  /** Get the full user with all fields. Use with care since this contains sensitive fields */
  fun getCompleteUser(id: UserID): UserDTO = userDao.findById(id)
    ?: throw NotFoundException("user", userID = id)

  fun getCurrentUser(): UserDTO {
    val currentUser = getCurrentUserOrNull()
      ?: throw AccessDeniedException("No user logged in")
    return currentUser.copy(giftCertificates = giftCertificateService.attachStatusToGiftCertificates(currentUser.giftCertificates))
  }

  fun getCurrentUserOrNull(): UserDTO? = maybeCurrentLoggedInUser()?.let { u -> getCompleteUser(u.id) }

  fun updateUser(newDetails: UserDetailsDTO): UserDTO {
    val currentUser = currentLoggedInUser()
    log.info("Update user {}", currentUser.id)
    return jdbi.inTransactionUnchecked {
      val dao = it.attach(UserDao::class.java)
      dao.updateUser(currentUser.id, newDetails.filmstadenMembershipId, newDetails.phone, newDetails.nick ?: Nick(""))
      dao.findById(currentUser.id)!!
    }
  }

  fun invalidateCalendarFeedId(): UserDTO {
    return updateCalendarFeedIdForCurrentUser(UUID.randomUUID())
  }

  fun disableCalendarFeed(): UserDTO {
    return updateCalendarFeedIdForCurrentUser(null)
  }

  private fun updateCalendarFeedIdForCurrentUser(newFeedId: UUID?): UserDTO {
    return jdbi.inTransactionUnchecked {
      it.createUpdate("UPDATE users SET calendar_feed_id = :newFeedId, last_modified_date = :now WHERE id = :userId")
        .bind("newFeedId", newFeedId)
        .bind("now", Instant.now())
        .bind("userId", currentLoggedInUser().id)
        .execute()

      it.attach(UserDao::class.java).findById(currentLoggedInUser().id)!!
    }
  }
}