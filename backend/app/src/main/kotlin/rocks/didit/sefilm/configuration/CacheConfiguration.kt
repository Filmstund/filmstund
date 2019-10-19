package rocks.didit.sefilm.configuration

import com.github.benmanes.caffeine.cache.Caffeine
import org.springframework.cache.caffeine.CaffeineCacheManager
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Primary
import java.time.Duration

@Configuration
class CacheConfiguration {

  @Bean
  @Primary
  fun filmstadenCacheManager(): CaffeineCacheManager {
    val ccm = CaffeineCacheManager("filmstaden")
    ccm.setCaffeine(
      Caffeine.newBuilder()
        .maximumSize(500)
        .expireAfterWrite(Duration.ofHours(12))
    )
    return ccm
  }

  @Bean
  fun graphQlCacheManager(): CaffeineCacheManager {
    val ccm = CaffeineCacheManager("graphql")
    ccm.setCaffeine(
      Caffeine.newBuilder()
        .maximumSize(1000)
        .expireAfterAccess(Duration.ofHours(6))
        .expireAfterWrite(Duration.ofHours(12))
    )
    return ccm
  }
}