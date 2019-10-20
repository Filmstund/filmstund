package se.filmstund.domain.id

import com.fasterxml.jackson.annotation.JsonValue

data class FilmstadenShowingID(val value: String) {
  companion object {
    fun from(id: String?): FilmstadenShowingID? = id?.let { FilmstadenShowingID(it) }
  }

  @JsonValue
  override fun toString(): String {
    return value
  }

}

fun FilmstadenShowingID?.isNullOrBlank(): Boolean = this?.value.isNullOrBlank()
