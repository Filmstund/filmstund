package rocks.didit.sefilm.web.controllers

import rocks.didit.sefilm.domain.SfTag
import java.time.LocalTime

data class ScreenDTO(val localTime: LocalTime,
                     val screen: String,
                     val cinema: String,
                     val tags: List<SfTag>)