package rocks.didit.sefilm.database.dao

import org.jdbi.v3.sqlobject.config.RegisterRowMapper
import org.jdbi.v3.sqlobject.customizer.BindBean
import org.jdbi.v3.sqlobject.kotlin.RegisterKotlinMapper
import org.jdbi.v3.sqlobject.statement.SqlBatch
import org.jdbi.v3.sqlobject.statement.SqlQuery
import org.jdbi.v3.sqlobject.statement.UseRowReducer
import rocks.didit.sefilm.database.ParticipantGiftCertReducer
import rocks.didit.sefilm.domain.dto.GiftCertificateDTO
import rocks.didit.sefilm.domain.dto.core.ParticipantDTO
import java.util.*

interface ParticipantDao {
  companion object {
    const val SELECTABLE_FIELDS = "p.user_id, p.showing_id, p.amount_owed, p.has_paid, p.participant_type AS type"
  }

  @SqlQuery("SELECT $SELECTABLE_FIELDS, gc.user_id gc_userId, gc.number gc_number, gc.expires_at gc_expiresAt, gc.is_deleted gc_deleted, u.filmstaden_id filmstadenMembershipId, u.id u_id, u.first_name u_firstName, u.last_name u_lastName, u.nick u_nick, u.phone u_phone, u.avatar u_avatar FROM participant p LEFT JOIN gift_certificate gc on p.user_id = gc.user_id and p.gift_certificate_used = gc.number JOIN users u on p.user_id = u.id WHERE p.showing_id = :showingId")
  @UseRowReducer(ParticipantGiftCertReducer::class)
  @RegisterKotlinMapper(GiftCertificateDTO::class, "gc")
  fun findAllParticipants(showingId: UUID): List<ParticipantDTO>

  @SqlQuery("SELECT exists(SELECT 1 FROM participant p WHERE p.showing_id = :showingId and p.user_id = :userId)")
  fun isParticipantOnShowing(userId: UUID, showingId: UUID): Boolean

  @SqlBatch("INSERT INTO participant (user_id, showing_id, amount_owed, has_paid, participant_type, gift_certificate_used) VALUES (:userId, :showingId, :amountOwed, :hasPaid, :type, :giftCertificateUsed?.number)")
  fun insertParticipantsOnShowing(@BindBean participant: List<ParticipantDTO>)

  fun insertParticipantOnShowing(participant: ParticipantDTO) = insertParticipantsOnShowing(listOf(participant))
}