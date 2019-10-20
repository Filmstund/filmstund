package se.filmstund.domain.dto.core

import se.filmstund.domain.dto.FilmstadenScreenDTO

data class CinemaScreenDTO(val id: String, val name: String) {
  companion object {
    fun from(filmstadenScreen: FilmstadenScreenDTO?) =
      filmstadenScreen?.let { CinemaScreenDTO(filmstadenScreen.ncgId, filmstadenScreen.title) }
  }
}
