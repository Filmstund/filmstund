package rocks.didit.sefilm.utils

import rocks.didit.sefilm.domain.IntValue
import rocks.didit.sefilm.domain.PhoneNumber
import rocks.didit.sefilm.domain.SEK
import rocks.didit.sefilm.domain.StringValue
import rocks.didit.sefilm.domain.SwishDataDTO
import rocks.didit.sefilm.domain.dto.core.ShowingDTO

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