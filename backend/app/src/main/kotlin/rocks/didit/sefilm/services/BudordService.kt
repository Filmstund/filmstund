package rocks.didit.sefilm.services

import org.jdbi.v3.core.Jdbi
import org.jdbi.v3.sqlobject.kotlin.onDemand
import org.springframework.stereotype.Service
import rocks.didit.sefilm.NotFoundException
import rocks.didit.sefilm.database.repositories.BudordRepository
import rocks.didit.sefilm.domain.dto.BioBudordDTO
import java.security.SecureRandom

@Service
class BudordService(jdbi: Jdbi) {
  private val repo = jdbi.onDemand<BudordRepository>()
  fun getAll() = repo.findAll()

  fun getRandom(): BioBudordDTO {
    val all = getAll()
    val count = all.count() - 1
    if (count <= 0) {
      throw NotFoundException("any budord :(")
    }

    val randomIndex = SecureRandom().nextInt(count)
    return all.elementAt(randomIndex)
  }
}