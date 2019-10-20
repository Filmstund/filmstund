package se.filmstund.utils

import se.filmstund.domain.IntValue
import se.filmstund.domain.PhoneNumber
import se.filmstund.domain.SEK
import se.filmstund.domain.StringValue
import se.filmstund.domain.SwishDataDTO
import se.filmstund.domain.dto.core.ShowingDTO

class SwishUtil {
  companion object {
    fun constructSwishUri(
      showing: ShowingDTO,
      payeePhone: PhoneNumber
    ): String {
      return SwishDataDTO(
        payee = StringValue(payeePhone.number),
        amount = IntValue(showing.price?.toKronor() ?: SEK.ZERO.ören),
        message = generateSwishMessage(showing.movieTitle, showing)
      )
        .generateUri()
        .toASCIIString()
    }

    private fun generateSwishMessage(movieTitle: String, showing: ShowingDTO): StringValue {
      val timeAndDate = " @ ${showing.date} ${showing.time}"
      val maxSize = movieTitle.length.coerceAtMost(50 - timeAndDate.length)
      val truncatedMovieTitle = movieTitle.substring(0, maxSize)

      return StringValue("$truncatedMovieTitle$timeAndDate")
    }

  }
}