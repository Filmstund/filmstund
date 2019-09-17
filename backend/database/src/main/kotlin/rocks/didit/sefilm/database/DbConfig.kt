package rocks.didit.sefilm.database

import org.jdbi.v3.core.Jdbi
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import javax.sql.DataSource

@Configuration
class DbConfig {
  @Bean
  fun jdbi(dataSource: DataSource): Jdbi =
    Jdbi.create(dataSource)
      .installPlugins()
}