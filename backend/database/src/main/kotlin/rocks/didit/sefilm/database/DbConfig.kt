package rocks.didit.sefilm.database

import org.jdbi.v3.core.Jdbi
import org.jdbi.v3.core.statement.SqlLogger
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import javax.sql.DataSource

@Configuration
class DbConfig {
  @Bean
  fun sqlLogger() = SqlLogger.NOP_SQL_LOGGER

  @Bean
  fun jdbi(dataSource: DataSource, sqlLogger: SqlLogger): Jdbi =
    Jdbi.create(dataSource)
      .registerColumnMapper(FilmstadenMembershipIdColumnMapper())
      .registerColumnMapper(TicketNumberColumnMapper())
      .registerArgument(FilmstadenMembershipArgumentFactory())
      .registerArgument(TicketNumberArgumentFactory())
      .setSqlLogger(sqlLogger)
      .installPlugins()
}