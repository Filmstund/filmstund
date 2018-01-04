package rocks.didit.sefilm.utils

import org.springframework.stereotype.Component

@Component
class MovieTitleUtil {
  companion object {
    val STUFF_TO_REMOVE = listOf(
      " - Klassiker",
      " - Bollywood",
      " (Director´s cut)",
      " (IMAX®)",
      " 70 mm"
    )

    val TITLES_TO_IGNORE = listOf(
      "Opera",
      "Balett",
      "Konsert"
    )
  }

  fun isTitleUnwanted(title: String): Boolean {
    return TITLES_TO_IGNORE.any {
      title.toLowerCase().contains(it.toLowerCase())
    }
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
    return trimmedTitle
  }
}