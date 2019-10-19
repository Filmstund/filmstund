package rocks.didit.sefilm.database

import org.jdbi.v3.core.Jdbi
import org.jdbi.v3.core.kotlin.KotlinMapper
import org.jdbi.v3.core.mapper.RowMapperFactory
import org.jdbi.v3.core.statement.SqlLogger
import org.jdbi.v3.core.statement.StatementContext
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import rocks.didit.sefilm.database.dao.BudordDao
import rocks.didit.sefilm.database.dao.LocationDao
import rocks.didit.sefilm.database.dao.MovieDao
import rocks.didit.sefilm.database.dao.ParticipantDao
import rocks.didit.sefilm.database.dao.ShowingDao
import rocks.didit.sefilm.database.dao.UserDao
import rocks.didit.sefilm.domain.dto.GiftCertificateDTO
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

  fun rowMapperFactoryWithPrefix(type: Class<*>, prefix: String): RowMapperFactory {
    return RowMapperFactory.of(type, KotlinMapper(type, prefix))
  }

  @Bean
  fun jdbi(dataSource: DataSource, sqlLogger: SqlLogger): Jdbi =
    Jdbi.create(dataSource)
      .registerColumnMapper(FilmstadenMembershipIdColumnMapper())
      .registerColumnMapper(TicketNumberColumnMapper())
      .registerColumnMapper(GoogleIdColumnMapper())
      .registerColumnMapper(PhoneNumberColumnMapper())
      .registerColumnMapper(IMDbIDColumnMapper())
      .registerColumnMapper(TMDbIDColumnMapper())
      .registerColumnMapper(Base64IDColumnMapper())
      .registerColumnMapper(SEKColumnMapper())
      .registerColumnMapper(UserIdColumnMapper())
      .registerArgument(FilmstadenMembershipArgumentFactory())
      .registerArgument(TicketNumberArgumentFactory())
      .registerArgument(GoogleIdArgumentFactory())
      .registerArgument(PhoneNumberArgumentFactory())
      .registerArgument(IMDbIDArgumentFactory())
      .registerArgument(TMDbIDArgumentFactory())
      .registerArgument(Base64IDArgumentFactory())
      .registerArgument(SEKArgumentFactory())
      .registerArgument(UserIdArgumentFactory())
      .registerRowMapper(rowMapperFactoryWithPrefix(GiftCertificateDTO::class.java, "gc"))
      .setSqlLogger(sqlLogger)
      .installPlugins()

  @Bean
  fun onDemandLocationDao(jdbi: Jdbi): LocationDao = jdbi.onDemand(LocationDao::class.java)

  @Bean
  fun onDemandUserDao(jdbi: Jdbi): UserDao = jdbi.onDemand(UserDao::class.java)

  @Bean
  fun onDemandShowingDao(jdbi: Jdbi): ShowingDao = jdbi.onDemand(ShowingDao::class.java)

  @Bean
  fun onDemandMovieDao(jdbi: Jdbi): MovieDao = jdbi.onDemand(MovieDao::class.java)

  @Bean
  fun onDemandParticipantDao(jdbi: Jdbi): ParticipantDao = jdbi.onDemand(ParticipantDao::class.java)

  @Bean
  fun onDemandBudordDao(jdbi: Jdbi): BudordDao = jdbi.onDemand(BudordDao::class.java)
}