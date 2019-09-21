package rocks.didit.sefilm.database

import org.jdbi.v3.core.result.LinkedHashMapRowReducer
import org.jdbi.v3.core.result.RowView
import rocks.didit.sefilm.domain.dto.GiftCertificateDTO
import rocks.didit.sefilm.domain.dto.UserDTO
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