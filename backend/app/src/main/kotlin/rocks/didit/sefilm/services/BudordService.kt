package rocks.didit.sefilm.services

import org.springframework.stereotype.Service
import rocks.didit.sefilm.database.dao.BudordDao
import rocks.didit.sefilm.domain.dto.BioBudordDTO

@Service
class BudordService(private val budordDao: BudordDao) {
  fun getAll(): List<BioBudordDTO> = budordDao.findAll()
  fun getRandom(): BioBudordDTO = budordDao.findRandom()
}