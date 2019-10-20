package se.filmstund.database.mongo

import org.springframework.core.convert.converter.Converter
import org.springframework.stereotype.Component
import se.filmstund.domain.id.IMDbID
import se.filmstund.domain.id.TMDbID

@Component
internal class ImdbIdConverter : Converter<String, IMDbID> {

  override fun convert(source: String): IMDbID? {
    if (source == "N/A") {
      return IMDbID.UNKNOWN
    }
    return IMDbID.valueOf(source)
  }
}

@Component
internal class TmdbIdConverter : Converter<Long, TMDbID> {
  override fun convert(source: Long): TMDbID? {
    return TMDbID.valueOf(source)
  }
}
