package rocks.didit.sefilm.utils

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class MovieFilterUtilTest {

    @Test
    fun `Title is unwanted if it contains IMAX`() {
        val movieFilter = MovieFilterUtil()
        val title = "Fifty Shades Freed i IMAX"
        assertThat(movieFilter.isTitleUnwanted(title)).isTrue()
    }

    @Test
    fun `Title is wanted if does NOT contain IMAX`() {
        val movieFilter = MovieFilterUtil()
        val title = "Fifty Shades Freed"
        assertThat(movieFilter.isTitleUnwanted(title)).isFalse()
    }

    @Test
    fun `Movie is wanted`() {
        val movieFilter = MovieFilterUtil()
        val genres = listOf("Sci-Fi", "Action")
        assertThat(movieFilter.isMovieUnwantedBasedOnGenre(genres)).isFalse()
    }

    @Test
    fun `Movie is unwanted if Balett`() {
        val movieFilter = MovieFilterUtil()
        val genres = listOf("Balett")
        assertThat(movieFilter.isMovieUnwantedBasedOnGenre(genres)).isTrue()
    }

    @Test
    fun `Movie is unwanted if Opera`() {
        val movieFilter = MovieFilterUtil()
        val genres = listOf("Opera")
        assertThat(movieFilter.isMovieUnwantedBasedOnGenre(genres)).isTrue()
    }

    @Test
    fun `Movie is unwanted if Konsert`() {
        val movieFilter = MovieFilterUtil()
        val genres = listOf("Konsert")
        assertThat(movieFilter.isMovieUnwantedBasedOnGenre(genres)).isTrue()
    }
}