package se.filmstund.services

import org.springframework.stereotype.Service
import se.filmstund.database.dao.BudordDao
import se.filmstund.domain.dto.BioBudordDTO

@Service
class BudordService(private val budordDao: BudordDao) {
  fun getAll(): List<BioBudordDTO> = budordDao.findAll()
  fun getRandom(): BioBudordDTO = budordDao.findRandom()
}