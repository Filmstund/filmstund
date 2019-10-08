package rocks.didit.sefilm.database.repositories

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import rocks.didit.sefilm.database.entities.GiftCertId
import rocks.didit.sefilm.database.entities.GiftCertificate
import rocks.didit.sefilm.domain.TicketNumber
import rocks.didit.sefilm.domain.dto.GiftCertificateDTO
import java.util.*

@Suppress("FunctionName")
@Repository
@Deprecated(message = "Don't use JPA")
interface GiftCertificateRepository : JpaRepository<GiftCertificate, GiftCertId> {

  @Query(value = "select new rocks.didit.sefilm.domain.dto.GiftCertificateDTO(gc.id.user.id, gc.id.number) from GiftCertificate gc where gc.id.user.id = :userId")
  fun findGiftCertificateDTOByUserId(userId: UUID): List<GiftCertificateDTO>

  @Query(value = "select gc from GiftCertificate gc join gc.id.user u where u.id = :userId")
  fun findByUserId(userId: UUID): List<GiftCertificate>

  fun findById_Number(number: TicketNumber): GiftCertificate?
  fun existsById_Number(number: TicketNumber): Boolean
}