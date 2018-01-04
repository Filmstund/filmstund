package rocks.didit.sefilm

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.stereotype.Component

@ConfigurationProperties("sefilm", ignoreInvalidFields = true)
@Component
class Properties {
  var tmdb = Tmdb()
  var enableSeeding: Boolean = true

  class Tmdb {
    var apikey: String? = null
    fun apiKeyExists(): Boolean {
      return !apikey.isNullOrBlank()
    }
  }
}