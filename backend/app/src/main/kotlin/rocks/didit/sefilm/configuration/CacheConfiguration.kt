package rocks.didit.sefilm.configuration

import com.github.benmanes.caffeine.cache.Caffeine
import org.springframework.cache.caffeine.CaffeineCacheManager
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import java.time.Duration

@Configuration
class CacheConfiguration {

  @Bean
  fun filmstadenCacheManager(): CaffeineCacheManager {
    val ccm = CaffeineCacheManager("filmstaden")
    ccm.setCaffeine(
      Caffeine.newBuilder()
        .maximumSize(500)
        .expireAfterWrite(Duration.ofHours(12))
    )
    return ccm
  }
}