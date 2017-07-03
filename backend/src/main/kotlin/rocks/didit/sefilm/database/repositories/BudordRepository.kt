package rocks.didit.sefilm.database.repositories

import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository
import rocks.didit.sefilm.database.entities.BioBudord

@Repository
interface BudordRepository : CrudRepository<BioBudord, Long>