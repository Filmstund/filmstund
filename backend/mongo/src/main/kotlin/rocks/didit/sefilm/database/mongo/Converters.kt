package rocks.didit.sefilm.database.mongo

import org.springframework.core.convert.converter.Converter
import org.springframework.stereotype.Component
import rocks.didit.sefilm.domain.id.IMDbID
import rocks.didit.sefilm.domain.id.TMDbID

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
