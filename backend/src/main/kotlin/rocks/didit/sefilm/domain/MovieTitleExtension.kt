package rocks.didit.sefilm.domain

import org.springframework.stereotype.Component

@Component
class MovieTitleExtension {
  companion object {
    val STUFF_TO_REMOVE = listOf(
      " - Klassiker",
      " - Bollywood",
      " (Director´s cut)"
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