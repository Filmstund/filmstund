package rocks.didit.sefilm.services

import org.jdbi.v3.core.Jdbi
import org.jdbi.v3.sqlobject.kotlin.onDemand
import org.springframework.stereotype.Service
import rocks.didit.sefilm.database.repositories.BudordRepository
import rocks.didit.sefilm.domain.dto.BioBudordDTO

@Service
class BudordService(jdbi: Jdbi) {
  private val repo = jdbi.onDemand<BudordRepository>()
  fun getAll(): List<BioBudordDTO> = repo.findAll()
  fun getRandom(): BioBudordDTO = repo.findRandom()
}