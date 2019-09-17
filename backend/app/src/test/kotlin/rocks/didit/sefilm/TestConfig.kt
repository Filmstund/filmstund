package rocks.didit.sefilm

import com.opentable.db.postgres.embedded.EmbeddedPostgres
import liquibase.integration.spring.SpringLiquibase
import org.jdbi.v3.core.Jdbi
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Primary
import javax.sql.DataSource

@TestConfiguration
class TestConfig {
  @Bean
  @Primary
  fun inMemoryDS(): DataSource {
    return EmbeddedPostgres
      .builder()
      .start()
      .postgresDatabase
  }

  @Bean
  fun springLiquibase(dataSource: DataSource): SpringLiquibase {
    val liquibase = SpringLiquibase()
    liquibase.isDropFirst = true
    liquibase.dataSource = dataSource
    liquibase.changeLog = "classpath:/db/changelog/db.changelog-1.0.sql"
    return liquibase
  }

  @Bean
  fun getJdbi(dataSource: DataSource): Jdbi {
    return Jdbi.create(dataSource)
      .installPlugins()
  }

}