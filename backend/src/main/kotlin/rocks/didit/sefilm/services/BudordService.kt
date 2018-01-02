package rocks.didit.sefilm.services

import org.springframework.stereotype.Component
import rocks.didit.sefilm.NotFoundException
import rocks.didit.sefilm.database.entities.BioBudord
import rocks.didit.sefilm.database.repositories.BudordRepository
import java.security.SecureRandom

@Component
class BudordService(private val budordRepo: BudordRepository) {
  fun getAll() = budordRepo.findAll().toList()

  fun getRandom(): BioBudord {
    val all = budordRepo.findAll()
    val count = all.count() - 1
    if (count <= 0) {
      throw NotFoundException("any budord :(")
    }

    val randomIndex = SecureRandom().nextInt(count)
    return all.elementAt(randomIndex)
  }
}