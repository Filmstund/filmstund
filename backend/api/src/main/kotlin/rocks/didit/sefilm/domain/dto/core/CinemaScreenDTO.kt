package rocks.didit.sefilm.domain.dto.core

import rocks.didit.sefilm.domain.dto.FilmstadenScreenDTO

data class CinemaScreenDTO(val id: String, val name: String) {
  companion object {
    fun from(filmstadenScreen: FilmstadenScreenDTO?) =
      filmstadenScreen?.let { CinemaScreenDTO(filmstadenScreen.ncgId, filmstadenScreen.title) }
  }
}
