package rocks.didit.sefilm.database

import org.jdbi.v3.core.result.LinkedHashMapRowReducer
import org.jdbi.v3.core.result.RowView
import rocks.didit.sefilm.domain.dto.GiftCertificateDTO
import rocks.didit.sefilm.domain.dto.core.LocationDTO
import rocks.didit.sefilm.domain.dto.core.ParticipantDTO
import rocks.didit.sefilm.domain.dto.core.ShowingDTO
import rocks.didit.sefilm.domain.dto.core.UserDTO
import java.util.*

class UserGiftCertReducer : LinkedHashMapRowReducer<UUID, UserDTO> {
  override fun accumulate(container: MutableMap<UUID, UserDTO>, rowView: RowView) {
    val id = rowView.getColumn("id", UUID::class.java)
    val user = container.computeIfAbsent(id) { rowView.getRow(UserDTO::class.java) }

    if (rowView.getColumn("user_id", UUID::class.java) != null) {
      val giftCert = rowView.getRow(GiftCertificateDTO::class.java)
      container.replace(id, user.copy(giftCertificates = user.giftCertificates.plus(giftCert)))
    }
  }
}

class LocationAliasReducer : LinkedHashMapRowReducer<String, LocationDTO> {
  override fun accumulate(container: MutableMap<String, LocationDTO>, rowView: RowView) {
    val id = rowView.getColumn("l_name", String::class.java)
    val location = container.computeIfAbsent(id) { rowView.getRow(LocationDTO::class.java) }

    val alias = rowView.getColumn("la_alias", String::class.java)
    if (alias != null) {
      container.replace(id, location.copy(alias = location.alias.plus(alias)))
    }
  }
}

class ShowingLocationReducer : LinkedHashMapRowReducer<UUID, ShowingDTO> {
  override fun accumulate(container: MutableMap<UUID, ShowingDTO>, rowView: RowView) {
    val id = rowView.getColumn("id", UUID::class.java)
    val showing = container.computeIfAbsent(id) { rowView.getRow(ShowingDTO::class.java) }

    val alias = rowView.getColumn("la_alias", String::class.java)
    if (alias != null) {
      val copiedShowing = showing.copy(
        location = showing.location.copy(alias = showing.location.alias.plus(alias))
      )
      container.replace(id, copiedShowing)
    }
  }
}

class ParticipantGiftCertReducer : LinkedHashMapRowReducer<Pair<UUID, UUID>, ParticipantDTO> {
  override fun accumulate(container: MutableMap<Pair<UUID, UUID>, ParticipantDTO>, rowView: RowView) {
    val userId = rowView.getColumn("user_id", UUID::class.java)
    val showingId = rowView.getColumn("showing_id", UUID::class.java)
    val pair = Pair(userId, showingId)
    val participant = container.computeIfAbsent(pair) {
      rowView.getRow(ParticipantDTO::class.java)
    }

    val gcUserId = rowView.getColumn("gc_userId", UUID::class.java)
    if (gcUserId != null) {
      val giftCert = rowView.getRow(GiftCertificateDTO::class.java)
      container.replace(pair, participant.copy(giftCertificateUsed = giftCert))
    }
  }
}
