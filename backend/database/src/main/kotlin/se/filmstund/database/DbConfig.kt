package se.filmstund.database

import org.jdbi.v3.core.Jdbi
import org.jdbi.v3.core.kotlin.KotlinMapper
import org.jdbi.v3.core.mapper.RowMapperFactory
import org.jdbi.v3.core.statement.SqlLogger
import org.jdbi.v3.core.statement.StatementContext
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import se.filmstund.database.dao.AttendeeDao
import se.filmstund.database.dao.BudordDao
import se.filmstund.database.dao.LocationDao
import se.filmstund.database.dao.MovieDao
import se.filmstund.database.dao.ShowingDao
import se.filmstund.database.dao.UserDao
import se.filmstund.domain.dto.core.GiftCertificateDTO
import se.filmstund.logger
import java.time.Duration
import javax.sql.DataSource

@Configuration
class DbConfig {
  private val log by logger()

  @Bean
  @ConditionalOnProperty(
    prefix = "filmstund", name = ["show-sql"],
    matchIfMissing = false, havingValue = "true"
  )
  fun sqlLogger() = object : SqlLogger {
    override fun logAfterExecution(context: StatementContext?) {
      val duration = Duration.between(context?.executionMoment, context?.completionMoment ?: context?.executionMoment)
      val msOrNs = if (duration.toMillis() <= 5) "${duration.toNanos()/1000000F}ms" else "${duration.toMillis()}ms"
      log.info("{}: {}", msOrNs, context?.renderedSql)
    }
  }

  fun rowMapperFactoryWithPrefix(type: Class<*>, prefix: String): RowMapperFactory {
    return RowMapperFactory.of(type, KotlinMapper(type, prefix))
  }

  @Bean
  fun jdbi(dataSource: DataSource, sqlLogger: SqlLogger?): Jdbi {
    val jdbi = Jdbi.create(dataSource)
      .registerColumnMapper(FilmstadenMembershipIdColumnMapper())
      .registerColumnMapper(TicketNumberColumnMapper())
      .registerColumnMapper(GoogleIdColumnMapper())
      .registerColumnMapper(PhoneNumberColumnMapper())
      .registerColumnMapper(IMDbIDColumnMapper())
      .registerColumnMapper(TMDbIDColumnMapper())
      .registerColumnMapper(Base64IDColumnMapper())
      .registerColumnMapper(SEKColumnMapper())
      .registerColumnMapper(UserIdColumnMapper())
      .registerColumnMapper(MovieIdColumnMapper())
      .registerColumnMapper(FilmstadenNcgIdColumnMapper())
      .registerColumnMapper(ShowingIdColumnMapper())
      .registerColumnMapper(FilmstadenShowingIdColumnMapper())
      .registerColumnMapper(CalendarFeedIdColumnMapper())
      .registerArgument(FilmstadenMembershipArgumentFactory())
      .registerArgument(TicketNumberArgumentFactory())
      .registerArgument(GoogleIdArgumentFactory())
      .registerArgument(PhoneNumberArgumentFactory())
      .registerArgument(IMDbIDArgumentFactory())
      .registerArgument(TMDbIDArgumentFactory())
      .registerArgument(Base64IDArgumentFactory())
      .registerArgument(SEKArgumentFactory())
      .registerArgument(UserIdArgumentFactory())
      .registerArgument(MovieIdArgumentFactory())
      .registerArgument(FilmstadenNcgIdArgumentFactory())
      .registerArgument(ShowingIdArgumentFactory())
      .registerArgument(FilmstadenShowingIdArgumentFactory())
      .registerArgument(CalendarFeedIdArgumentFactory())
      .registerRowMapper(rowMapperFactoryWithPrefix(GiftCertificateDTO::class.java, "gc"))
      .installPlugins()
    if (sqlLogger != null) {
      return jdbi.setSqlLogger(sqlLogger)
    }
    return jdbi
  }

  @Bean
  fun onDemandLocationDao(jdbi: Jdbi): LocationDao = jdbi.onDemand(LocationDao::class.java)

  @Bean
  fun onDemandUserDao(jdbi: Jdbi): UserDao = jdbi.onDemand(UserDao::class.java)

  @Bean
  fun onDemandShowingDao(jdbi: Jdbi): ShowingDao = jdbi.onDemand(ShowingDao::class.java)

  @Bean
  fun onDemandMovieDao(jdbi: Jdbi): MovieDao = jdbi.onDemand(MovieDao::class.java)

  @Bean
  fun onDemandAttendeeDao(jdbi: Jdbi): AttendeeDao = jdbi.onDemand(AttendeeDao::class.java)

  @Bean
  fun onDemandBudordDao(jdbi: Jdbi): BudordDao = jdbi.onDemand(BudordDao::class.java)
}