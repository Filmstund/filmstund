package se.filmstund.database.dao

import org.jdbi.v3.sqlobject.customizer.BindBean
import org.jdbi.v3.sqlobject.customizer.Timestamped
import org.jdbi.v3.sqlobject.kotlin.RegisterKotlinMapper
import org.jdbi.v3.sqlobject.statement.SqlBatch
import org.jdbi.v3.sqlobject.statement.SqlQuery
import org.jdbi.v3.sqlobject.statement.SqlUpdate
import org.jdbi.v3.sqlobject.statement.UseRowReducer
import se.filmstund.database.AttendeeGiftCertReducer
import se.filmstund.domain.SEK
import se.filmstund.domain.dto.GiftCertificateDTO
import se.filmstund.domain.dto.core.AttendeeDTO
import se.filmstund.domain.id.ShowingID
import se.filmstund.domain.id.UserID

interface AttendeeDao {
  companion object {
    const val SELECTABLE_FIELDS = "a.user_id, a.showing_id, a.amount_owed, a.has_paid, a.attendee_type AS type"
    const val EXTRA_FIELDS =
      "gc.user_id gc_userId, gc.number gc_number, gc.expires_at gc_expiresAt, u.filmstaden_membership_id filmstadenMembershipId, u.id u_id, u.first_name u_firstName, u.last_name u_lastName, u.nick u_nick, u.phone u_phone, u.avatar u_avatar"
  }

  @SqlQuery("SELECT $SELECTABLE_FIELDS, $EXTRA_FIELDS FROM attendee a LEFT JOIN gift_certificate gc on a.user_id = gc.user_id and a.gift_certificate_used = gc.number JOIN users u on a.user_id = u.id WHERE a.showing_id = :showingId")
  @UseRowReducer(AttendeeGiftCertReducer::class)
  @RegisterKotlinMapper(GiftCertificateDTO::class, "gc")
  fun findAllAttendees(showingId: ShowingID): List<AttendeeDTO>

  @SqlQuery("SELECT $SELECTABLE_FIELDS, $EXTRA_FIELDS FROM attendee a LEFT JOIN gift_certificate gc on a.user_id = gc.user_id and a.gift_certificate_used = gc.number JOIN users u on a.user_id = u.id WHERE a.showing_id = :showingId AND a.user_id = :userId")
  @UseRowReducer(AttendeeGiftCertReducer::class)
  @RegisterKotlinMapper(GiftCertificateDTO::class, "gc")
  fun findByUserAndShowing(userId: UserID, showingId: ShowingID): AttendeeDTO?

  @SqlQuery("SELECT exists(SELECT 1 FROM attendee a WHERE a.showing_id = :showingId and a.user_id = :userId)")
  fun isAttendeeOnShowing(userId: UserID, showingId: ShowingID): Boolean

  @SqlBatch("INSERT INTO attendee (user_id, showing_id, amount_owed, has_paid, attendee_type, gift_certificate_used) VALUES (:userId, :showingId, :amountOwed, :hasPaid, :type, :giftCertificateUsed?.number)")
  fun insertAttendeeOnShowing(@BindBean attendees: List<AttendeeDTO>)

  fun insertAttendeeOnShowing(attendee: AttendeeDTO) = insertAttendeeOnShowing(listOf(attendee))

  // TODO: Add lastModifiedDate
  @SqlQuery("UPDATE attendee att SET has_paid = :hasPaid, amount_owed = COALESCE(:amountOwed, amount_owed) FROM (SELECT a.user_id, a.showing_id, a.attendee_type AS type, $EXTRA_FIELDS FROM attendee a LEFT JOIN gift_certificate gc on a.user_id = gc.user_id and a.gift_certificate_used = gc.number JOIN users u on a.user_id = u.id WHERE a.showing_id = :showingId AND a.user_id = :userId) AS pu JOIN showing s ON s.id = pu.showing_id AND s.admin = :adminUser WHERE att.showing_id = pu.showing_id AND att.user_id = pu.user_id RETURNING pu.*, has_paid, amount_owed")
  @UseRowReducer(AttendeeGiftCertReducer::class)
  @RegisterKotlinMapper(GiftCertificateDTO::class, "gc")
  fun updatePaymentStatus(
    userId: UserID,
    showingId: ShowingID,
    adminUser: UserID,
    hasPaid: Boolean,
    amountOwed: SEK?
  ): AttendeeDTO?

  @SqlUpdate("DELETE FROM attendee a USING showing s WHERE a.user_id = :userId AND a.showing_id = :showingId AND s.id = :showingId AND s.tickets_bought = false")
  fun deleteByUserAndShowing(userId: UserID, showingId: ShowingID): Boolean

  // TODO test me
  @Timestamped
  @SqlUpdate("UPDATE attendee a SET has_paid = true, amount_owed = 0, last_modified_date = :now FROM showing s WHERE a.showing_id = s.id AND s.admin = :adminUser AND a.showing_id = :showingId AND (a.gift_certificate_used IS NOT NULL OR a.user_id = :adminUser)")
  fun markGCAttendeesAsHavingPaid(showingId: ShowingID, adminUser: UserID): Boolean

  @Timestamped
  @SqlUpdate("UPDATE attendee a SET amount_owed = :amountOwed, last_modified_date = :now FROM showing s WHERE a.showing_id = s.id AND s.admin = :adminUser AND a.showing_id = :showingId AND a.gift_certificate_used IS NULL AND has_paid = false")
  fun updateAmountOwedForSwishAttendees(showingId: ShowingID, adminUser: UserID, amountOwed: SEK): Boolean
}