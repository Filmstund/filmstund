package rocks.didit.sefilm.domain.id

import com.fasterxml.jackson.annotation.JsonValue

data class FilmstadenNcgID(val value: String) {
  companion object {
    fun from(ncgId: String?): FilmstadenNcgID? = ncgId?.let { FilmstadenNcgID(it) }
  }

  val ncgId: String get() = value
  @JsonValue
  override fun toString(): String {
    return value
  }

}

fun FilmstadenNcgID?.isNullOrBlank(): Boolean = this?.value.isNullOrBlank()
