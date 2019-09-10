package rocks.didit.sefilm.database.repositories

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import rocks.didit.sefilm.database.entities.GiftCertId
import rocks.didit.sefilm.database.entities.GiftCertificate
import rocks.didit.sefilm.domain.TicketNumber

@Suppress("FunctionName")
@Repository
interface GiftCertificateRepository : JpaRepository<GiftCertificate, GiftCertId> {
  fun findById_Number(number: TicketNumber): GiftCertificate?

  fun existsById_Number(number: TicketNumber): Boolean
}