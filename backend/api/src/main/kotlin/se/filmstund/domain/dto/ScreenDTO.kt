package se.filmstund.domain.dto

import java.time.LocalTime

data class ScreenDTO(
  val localTime: LocalTime,
  val screen: String,
  val cinema: String,
  val tags: List<FilmstadenTag>
)