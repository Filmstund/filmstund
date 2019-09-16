package rocks.didit.sefilm.utils

import rocks.didit.sefilm.database.entities.Showing
import rocks.didit.sefilm.domain.IntValue
import rocks.didit.sefilm.domain.PhoneNumber
import rocks.didit.sefilm.domain.StringValue
import rocks.didit.sefilm.domain.SwishDataDTO

class SwishUtil {
  companion object {
    fun constructSwishUri(
      showing: Showing,
      payeePhone: PhoneNumber
    ): String {
      return SwishDataDTO(
        payee = StringValue(payeePhone.number),
        amount = IntValue(showing.price.toKronor()),
        message = generateSwishMessage(showing.movie.title, showing)
      )
        .generateUri()
        .toASCIIString()
    }

    private fun generateSwishMessage(movieTitle: String, showing: Showing): StringValue {
      val timeAndDate = " @ ${showing.date} ${showing.time}"
      val maxSize = movieTitle.length.coerceAtMost(50 - timeAndDate.length)
      val truncatedMovieTitle = movieTitle.substring(0, maxSize)

      return StringValue("$truncatedMovieTitle$timeAndDate")
    }

  }
}