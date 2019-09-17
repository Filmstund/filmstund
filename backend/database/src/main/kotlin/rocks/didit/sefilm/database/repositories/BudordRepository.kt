package rocks.didit.sefilm.database.repositories

import org.jdbi.v3.sqlobject.statement.SqlQuery
import rocks.didit.sefilm.domain.dto.BioBudordDTO

interface BudordRepository {
  @SqlQuery("SELECT * FROM bio_budord")
  fun findAll(): List<BioBudordDTO>
}