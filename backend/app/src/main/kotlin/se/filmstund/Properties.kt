package se.filmstund

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.stereotype.Component
import java.time.Duration

@ConfigurationProperties("filmstund", ignoreInvalidFields = true)
@Component
class Properties {
  var baseUrl = BaseUrl()
  var tmdb = Tmdb()
  var enableSeeding: Boolean = true
  var enableReassignment: Boolean = true
  var defaultCity: String = "GB"

  var google = Google()

  var notification = Notification()

  var calendar = Calendar()

  class Tmdb {
    var apikey: String? = null
    fun apiKeyExists(): Boolean {
      return !apikey.isNullOrBlank()
    }
  }

  class Google {
    var clientId: String = ""
    var jwkUri: String = ""
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
    var slack = Slack()
  }

  class Pushover {
    var enabled: Boolean = false
    var apiToken: String? = null
    var url: String = ""
    var validateUrl: String = ""
  }

  class Slack {
    var enabled: Boolean = false
    var slackHookUrl: String = ""
  }

  class Calendar {
    var durationBeforeAlert: Duration = Duration.ofHours(4)
  }
}