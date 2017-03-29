package rocks.didit.sefilm

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties("sefilm")
class Properties {
    var tmdb = Tmdb()

    class Tmdb {
        var apikey: String? = null
        fun apiKeyExists(): Boolean {
            return !apikey.isNullOrBlank()
        }
    }
}