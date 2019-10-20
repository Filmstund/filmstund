package se.filmstund.database.dao

import org.jdbi.v3.sqlobject.statement.SqlQuery
import se.filmstund.domain.dto.BioBudordDTO

interface BudordDao {
  @SqlQuery("SELECT * FROM bio_budord")
  fun findAll(): List<BioBudordDTO>

  @SqlQuery("SELECT * FROM bio_budord ORDER BY random() limit 1")
  fun findRandom(): BioBudordDTO
}