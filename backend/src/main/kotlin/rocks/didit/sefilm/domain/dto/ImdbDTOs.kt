package rocks.didit.sefilm.domain.dto

/**
 * @param v unknown
 * @param q query used
 * @param d List of movie/shows/people results actually found
 */
data class ImdbSearchResults(val v: Int,
                             val q: String,
                             val d: List<ImdbResult>?)

/**
 * @param l title
 * @param id IMDb ID
 * @param s Primary actors
 * @param y Year
 * @param q Type, feature, TV-Show etc
 * @param i Image url, width, and height
 */
data class ImdbResult(val l: String,
                      val id: String,
                      val s: String?,
                      val y: Int?,
                      val q: String?,
                      val i: List<String>?)

