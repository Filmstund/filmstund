package rocks.didit.sefilm.database.dao

import org.jdbi.v3.sqlobject.customizer.BindBean
import org.jdbi.v3.sqlobject.statement.SqlBatch
import org.jdbi.v3.sqlobject.statement.SqlQuery
import org.jdbi.v3.sqlobject.statement.SqlUpdate
import org.jdbi.v3.sqlobject.statement.UseRowReducer
import rocks.didit.sefilm.database.UserGiftCertReducer
import rocks.didit.sefilm.domain.dto.GiftCertificateDTO
import rocks.didit.sefilm.domain.dto.UserDTO
import java.util.*

interface UserDao {
  @SqlQuery("SELECT * FROM users u LEFT JOIN gift_certificate gc on u.id = gc.user_id")
  @UseRowReducer(UserGiftCertReducer::class)
  fun findAll(): List<UserDTO>

  @SqlQuery("SELECT * FROM users u LEFT JOIN gift_certificate gc on u.id = gc.user_id WHERE u.id = :userId")
  @UseRowReducer(UserGiftCertReducer::class)
  fun findById(userId: UUID): UserDTO?

  @SqlQuery("SELECT exists(SELECT 1 FROM users where id = :userId)")
  fun existsById(userId: UUID): Boolean

  @SqlUpdate("INSERT INTO users (id, google_id, filmstaden_id, first_name, last_name, nick, email, phone, avatar, calendar_feed_id) VALUES (:id, :googleId, :filmstadenId, :firstName, :lastName, :nick, :email, :phone, :avatar, :calendarFeedId)")
  fun insertUser(@BindBean user: UserDTO)

  @SqlBatch("INSERT INTO gift_certificate (user_id, number, expires_at, is_deleted) VALUES (:userId, :number, :expiresAt, false)")
  fun insertGiftCertificates(@BindBean giftCerts: Collection<GiftCertificateDTO>): IntArray

  fun insertGiftCertificate(giftCert: GiftCertificateDTO) = insertGiftCertificates(listOf(giftCert))
}