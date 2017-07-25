package rocks.didit.sefilm.database

import org.springframework.core.convert.converter.Converter
import org.springframework.stereotype.Component
import rocks.didit.sefilm.domain.IMDbID
import rocks.didit.sefilm.domain.TMDbID

@Component
class ImdbIdConverter : Converter<String, IMDbID> {
  override fun convert(source: String?): IMDbID {
    if (source == null) {
      return IMDbID.MISSING
    }
    if (source == "N/A") {
      return IMDbID.UNKNOWN
    }
    return IMDbID.valueOf(source)
  }
}

@Component
class TmdbIdConverter : Converter<Long, TMDbID> {
  override fun convert(source: Long?): TMDbID {
    if (source == null) {
      return TMDbID.MISSING
    }
    return TMDbID.valueOf(source)
  }
}
