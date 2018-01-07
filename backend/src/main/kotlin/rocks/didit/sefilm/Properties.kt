package rocks.didit.sefilm

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.stereotype.Component

@ConfigurationProperties("sefilm", ignoreInvalidFields = true)
@Component
class Properties {
  var baseUrl = BaseUrl()
  var tmdb = Tmdb()
  var enableSeeding: Boolean = true
  var defaultCity: String = "GB"

  var google = Google()
  var login = Login()

  var notification = Notification()

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

  class BaseUrl {
    var api: String = "N/A"
    var frontend: String = "N/A"
  }

  class Notification {
    var provider = Provider()
  }

  class Provider {
    var pushover = Pushover()
  }

  class Pushover {
    var enabled: Boolean = false
    var apiToken: String? = null
    var url: String = ""
  }
}