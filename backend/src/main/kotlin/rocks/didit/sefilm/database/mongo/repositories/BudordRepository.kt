package rocks.didit.sefilm.database.mongo.repositories

import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository
import rocks.didit.sefilm.database.mongo.entities.BioBudord

@Repository
interface BudordRepository : CrudRepository<BioBudord, Long>