package rocks.didit.sefilm.utils

import org.springframework.stereotype.Component
import rocks.didit.sefilm.domain.dto.SfMovieDTO
import java.time.LocalDate

@Component
class MovieFilterUtil {
  companion object {
    private val STUFF_TO_REMOVE = listOf(
      " - Klassiker",
      " - Bollywood",
      " (Director´s cut)",
      " 70 mm",
      " - Exklusiv smygpremiär",
      " - Smygpremiär"
    )

    private val GENRES_TO_IGNORE = listOf(
      "Opera",
      "Balett",
      "Konsert",
      "Hemlig"
    )

    private val TITLES_TO_IGNORE = listOf(
      " (IMAX®)",
      " i IMAX",
      " VIP",
      " nyårskonsert"
    )
  }

  fun isTitleUnwanted(title: String): Boolean {
    return TITLES_TO_IGNORE.any {
      title.contains(it, true)
    }
  }

  fun isMovieUnwantedBasedOnGenre(genres: Collection<String>): Boolean {
    return genres
      .intersect(GENRES_TO_IGNORE)
      .isNotEmpty()
  }

  fun titleRequiresTrimming(title: String) =
    STUFF_TO_REMOVE.any {
      title.contains(it)
    }

  fun trimTitle(title: String): String {
    var trimmedTitle = title
    STUFF_TO_REMOVE.forEach {
      trimmedTitle = trimmedTitle.replace(it, "")
    }
    return trimmedTitle.trim()
  }

  fun isNewerThan(movie: SfMovieDTO, thisDate: LocalDate = LocalDate.now().minusMonths(1)) =
    movie.releaseDate.isAfter(thisDate)
}