package rocks.didit.sefilm.database

import org.jdbi.v3.core.Jdbi
import org.jdbi.v3.core.statement.SqlLogger
import org.jdbi.v3.core.statement.StatementContext
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import rocks.didit.sefilm.logger
import javax.sql.DataSource

@Configuration
class DbConfig {
  private val log by logger()
  @Bean
  fun sqlLogger() = object : SqlLogger {
    override fun logAfterExecution(context: StatementContext?) {
      // TODO: only do this if sql-logging is enabled
      log.info("{}", context?.renderedSql)
    }
  }

  @Bean
  fun jdbi(dataSource: DataSource, sqlLogger: SqlLogger): Jdbi =
    Jdbi.create(dataSource)
      .registerColumnMapper(FilmstadenMembershipIdColumnMapper())
      .registerColumnMapper(TicketNumberColumnMapper())
      .registerColumnMapper(GoogleIdColumnMapper())
      .registerColumnMapper(PhoneNumberColumnMapper())
      .registerArgument(FilmstadenMembershipArgumentFactory())
      .registerArgument(TicketNumberArgumentFactory())
      .registerArgument(GoogleIdArgumentFactory())
      .registerArgument(PhoneNumberArgumentFactory())
      .setSqlLogger(sqlLogger)
      .installPlugins()
}