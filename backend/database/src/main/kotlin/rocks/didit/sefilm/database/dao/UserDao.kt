package rocks.didit.sefilm.database.dao

import org.jdbi.v3.sqlobject.customizer.BindBean
import org.jdbi.v3.sqlobject.customizer.Timestamped
import org.jdbi.v3.sqlobject.statement.SqlBatch
import org.jdbi.v3.sqlobject.statement.SqlQuery
import org.jdbi.v3.sqlobject.statement.SqlUpdate
import org.jdbi.v3.sqlobject.statement.UseRowReducer
import rocks.didit.sefilm.database.UserGiftCertReducer
import rocks.didit.sefilm.domain.GoogleId
import rocks.didit.sefilm.domain.TicketNumber
import rocks.didit.sefilm.domain.dto.GiftCertificateDTO
import rocks.didit.sefilm.domain.dto.PublicUserDTO
import rocks.didit.sefilm.domain.dto.core.UserDTO
import java.util.*

interface UserDao {
  @SqlQuery("SELECT count(1) FROM users")
  fun count(): Int

  @SqlQuery("SELECT id FROM users WHERE google_id = :googleId")
  fun findIdByGoogleId(googleId: GoogleId): UUID

  @SqlQuery("SELECT * FROM users u LEFT JOIN gift_certificate gc on u.id = gc.user_id")
  @UseRowReducer(UserGiftCertReducer::class)
  fun findAll(): List<UserDTO>

  @SqlQuery("SELECT * FROM users u LEFT JOIN gift_certificate gc on u.id = gc.user_id WHERE u.id = :userId")
  @UseRowReducer(UserGiftCertReducer::class)
  fun findById(userId: UUID): UserDTO?

  @SqlQuery("SELECT u.id, u.first_name, u.last_name, u.nick, u.phone, u.avatar FROM users u WHERE u.id = :userId")
  fun findPublicUserById(userId: UUID): PublicUserDTO?

  @SqlQuery("SELECT u.id, u.first_name, u.last_name, u.nick, u.phone, u.avatar FROM users u WHERE u.google_id = :googleId")
  fun findPublicUserByGoogleId(googleId: GoogleId): PublicUserDTO?

  @SqlQuery("SELECT exists(SELECT 1 FROM users where id = :userId)")
  fun existsById(userId: UUID): Boolean

  @SqlQuery("SELECT exists(SELECT 1 FROM users where google_id = :googleId)")
  fun existsByGoogleId(googleId: String): Boolean

  @SqlUpdate("INSERT INTO users (id, google_id, filmstaden_id, first_name, last_name, nick, email, phone, avatar, calendar_feed_id, last_login, last_modified_date) VALUES (:id, :googleId, :filmstadenId, :firstName, :lastName, :nick, :email, :phone, :avatar, :calendarFeedId, :lastLogin, :lastModifiedDate)")
  fun insertUser(@BindBean user: UserDTO)

  fun insertUserAndGiftCerts(user: UserDTO) {
    insertUser(user)
    if (user.giftCertificates.isNotEmpty()) {
      insertGiftCertificates(user.giftCertificates)
    }
  }

  @SqlUpdate("UPDATE users SET first_name = :firstName, last_name = :lastName, avatar = :avatar, last_login = :now, last_modified_date = :now WHERE id = :userId")
  @Timestamped
  fun updateUserOnLogin(userId: UUID, firstName: String, lastName: String, avatar: String?): Boolean

  @SqlBatch("INSERT INTO gift_certificate (user_id, number, expires_at, is_deleted) VALUES (:userId, :number, :expiresAt, :deleted)")
  fun insertGiftCertificates(@BindBean giftCerts: Collection<GiftCertificateDTO>): IntArray

  fun insertGiftCertificate(giftCert: GiftCertificateDTO) = insertGiftCertificates(listOf(giftCert))

  @SqlQuery("SELECT * FROM gift_certificate gc WHERE gc.user_id = :userId AND gc.number = :number")
  fun findGiftCertByUserAndNumber(userId: UUID, number: TicketNumber): GiftCertificateDTO?

  @SqlQuery("SELECT exists(SELECT 1 FROM gift_certificate gc WHERE gc.number = :number)")
  fun existGiftCertByNumber(number: TicketNumber): Boolean
}