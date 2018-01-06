package rocks.didit.sefilm

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.stereotype.Component

@ConfigurationProperties("sefilm", ignoreInvalidFields = true)
@Component
class Properties {
  var tmdb = Tmdb()
  var enableSeeding: Boolean = true
  var defaultCity: String = "GB"

  var google = Google()
  var login = Login()

  class Tmdb {
    var apikey: String? = null
    fun apiKeyExists(): Boolean {
      return !apikey.isNullOrBlank()
    }
  }

  class Google {
    var clientId: String = ""
    var clientSecret: String = ""
    var accessTokenUri: String = ""
    var userAuthorizationUri: String = ""
    var redirectUri: String = ""
  }

  class Login {
    var baseRedirectUri: String = "http://localhost:3000"
    var defaultRedirectPath: String = "user"
  }
}