package rocks.didit.sefilm.database.dao

import org.jdbi.v3.sqlobject.customizer.BindBean
import org.jdbi.v3.sqlobject.customizer.Timestamped
import org.jdbi.v3.sqlobject.kotlin.RegisterKotlinMapper
import org.jdbi.v3.sqlobject.statement.SqlBatch
import org.jdbi.v3.sqlobject.statement.SqlQuery
import org.jdbi.v3.sqlobject.statement.SqlUpdate
import org.jdbi.v3.sqlobject.statement.UseRowReducer
import rocks.didit.sefilm.database.ParticipantGiftCertReducer
import rocks.didit.sefilm.domain.SEK
import rocks.didit.sefilm.domain.dto.GiftCertificateDTO
import rocks.didit.sefilm.domain.dto.core.ParticipantDTO
import java.util.*

interface ParticipantDao {
  companion object {
    const val SELECTABLE_FIELDS = "p.user_id, p.showing_id, p.amount_owed, p.has_paid, p.participant_type AS type"
    const val EXTRA_FIELDS =
      "gc.user_id gc_userId, gc.number gc_number, gc.expires_at gc_expiresAt, u.filmstaden_id filmstadenMembershipId, u.id u_id, u.first_name u_firstName, u.last_name u_lastName, u.nick u_nick, u.phone u_phone, u.avatar u_avatar"
  }

  @SqlQuery("SELECT $SELECTABLE_FIELDS, $EXTRA_FIELDS FROM participant p LEFT JOIN gift_certificate gc on p.user_id = gc.user_id and p.gift_certificate_used = gc.number JOIN users u on p.user_id = u.id WHERE p.showing_id = :showingId")
  @UseRowReducer(ParticipantGiftCertReducer::class)
  @RegisterKotlinMapper(GiftCertificateDTO::class, "gc")
  fun findAllParticipants(showingId: UUID): List<ParticipantDTO>

  // TODO: test this
  @SqlQuery("SELECT $SELECTABLE_FIELDS, $EXTRA_FIELDS FROM participant p LEFT JOIN gift_certificate gc on p.user_id = gc.user_id and p.gift_certificate_used = gc.number JOIN users u on p.user_id = u.id WHERE p.showing_id = :showingId AND p.user_id = :userId")
  @UseRowReducer(ParticipantGiftCertReducer::class)
  @RegisterKotlinMapper(GiftCertificateDTO::class, "gc")
  fun findByUserAndShowing(userId: UUID, showingId: UUID): ParticipantDTO?

  @SqlQuery("SELECT exists(SELECT 1 FROM participant p WHERE p.showing_id = :showingId and p.user_id = :userId)")
  fun isParticipantOnShowing(userId: UUID, showingId: UUID): Boolean

  @SqlBatch("INSERT INTO participant (user_id, showing_id, amount_owed, has_paid, participant_type, gift_certificate_used) VALUES (:userId, :showingId, :amountOwed, :hasPaid, :type, :giftCertificateUsed?.number)")
  fun insertParticipantsOnShowing(@BindBean participant: List<ParticipantDTO>)

  fun insertParticipantOnShowing(participant: ParticipantDTO) = insertParticipantsOnShowing(listOf(participant))

  // TODO: Add lastModifiedDate
  @SqlQuery("UPDATE participant part SET has_paid = :hasPaid, amount_owed = COALESCE(:amountOwed, amount_owed) FROM (SELECT p.user_id, p.showing_id, p.participant_type AS type, $EXTRA_FIELDS FROM participant p LEFT JOIN gift_certificate gc on p.user_id = gc.user_id and p.gift_certificate_used = gc.number JOIN users u on p.user_id = u.id WHERE p.showing_id = :showingId AND p.user_id = :userId) AS pu JOIN showing s ON s.id = pu.showing_id AND s.admin = :adminUser WHERE part.showing_id = pu.showing_id AND part.user_id = pu.user_id RETURNING pu.*, has_paid, amount_owed")
  @UseRowReducer(ParticipantGiftCertReducer::class)
  @RegisterKotlinMapper(GiftCertificateDTO::class, "gc")
  fun updatePaymentStatus(
    userId: UUID,
    showingId: UUID,
    adminUser: UUID,
    hasPaid: Boolean,
    amountOwed: SEK?
  ): ParticipantDTO?

  // TODO test me
  @SqlUpdate("DELETE FROM participant p USING showing s WHERE p.user_id = :userId AND p.showing_id = :showingId AND s.id = :showingId AND s.tickets_bought = false")
  fun deleteByUserAndShowing(userId: UUID, showingId: UUID): Boolean

  // TODO test me
  @Timestamped
  @SqlUpdate("UPDATE participant p SET has_paid = true, amount_owed = 0, last_modified_date = :now FROM showing s WHERE p.showing_id = s.id AND s.admin = :adminUser AND p.showing_id = :showingId AND (p.gift_certificate_used IS NULL OR p.user_id = :adminUser)")
  fun markGCParticipantsAsHavingPaid(showingId: UUID, adminUser: UUID): Boolean
}