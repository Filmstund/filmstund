package rocks.didit.sefilm.services

import org.springframework.stereotype.Service

@Service
class SlugService {
  companion object {
    const val MAX_LENGTH = 45
  }

  fun generateSlugFor(str: String): String = sluggifyString(str)

  private fun sluggifyString(str: String): String {
    return str.toLowerCase()
      .replace("-", "")
      .replace(" ", "-")
      .replace("'", "")
      .replace(":", "")
      .replace("å", "a")
      .replace("ä", "a")
      .replace("ö", "o")
      .replace("&", "and")
      .replace(",", "")
      .replace("ó", "o")
      .replace("é", "e")
      .replace("®", "")
      .trimToLength(MAX_LENGTH)
  }

  private fun String.trimToLength(length: Int): String {
    if (this.length <= length) {
      return this
    }
    return this.substring(0, MAX_LENGTH)
  }
}