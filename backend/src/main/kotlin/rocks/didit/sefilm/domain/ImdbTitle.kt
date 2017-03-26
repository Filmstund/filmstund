package rocks.didit.sefilm.domain

data class ImdbTitle(val id: String) {
    init {
        if (!id.matches(Regex("^tt[0-9]{7}"))) {
            throw IllegalArgumentException("Illegal title id format: $id")
        }
    }
    val url: String = "http://www.imdb.com/title/$id/"
}
