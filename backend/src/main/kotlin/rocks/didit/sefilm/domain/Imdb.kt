package rocks.didit.sefilm.domain

import java.io.Serializable

data class Imdb(val id: String): Serializable {
    init {
        if (!id.matches(Regex("^tt[0-9]{7}"))) {
            throw IllegalArgumentException("Illegal title id format: $id")
        }
    }
    val url: String = "http://www.imdb.com/title/$id/"
}
