@file:Suppress("unused")

package rocks.didit.sefilm.database

import rocks.didit.sefilm.domain.Base64ID
import rocks.didit.sefilm.domain.FilmstadenMembershipId
import rocks.didit.sefilm.domain.GoogleId
import rocks.didit.sefilm.domain.IMDbID
import rocks.didit.sefilm.domain.PhoneNumber
import rocks.didit.sefilm.domain.SEK
import rocks.didit.sefilm.domain.TMDbID
import rocks.didit.sefilm.domain.TicketNumber
import javax.persistence.AttributeConverter
import javax.persistence.Converter

@Converter
class UserIdConverter : AttributeConverter<GoogleId, String> {
  override fun convertToDatabaseColumn(attribute: GoogleId?): String? = attribute?.id
  override fun convertToEntityAttribute(dbData: String?): GoogleId? = dbData?.let { GoogleId(it) }
}

@Converter
class FSIdConverter : AttributeConverter<FilmstadenMembershipId, String> {
  override fun convertToDatabaseColumn(attribute: FilmstadenMembershipId?): String? = attribute?.value
  override fun convertToEntityAttribute(dbData: String?): FilmstadenMembershipId? =
    dbData?.let { FilmstadenMembershipId.valueOf(it) }
}

@Converter
class PhoneNumberConverter : AttributeConverter<PhoneNumber, String> {
  override fun convertToDatabaseColumn(attribute: PhoneNumber?): String? = attribute?.number
  override fun convertToEntityAttribute(dbData: String?): PhoneNumber? = dbData?.let { PhoneNumber(it) }
}

@Converter
class TicketNumberConverter : AttributeConverter<TicketNumber, String> {
  override fun convertToDatabaseColumn(attribute: TicketNumber?): String? = attribute?.number
  override fun convertToEntityAttribute(dbData: String?): TicketNumber? = dbData?.let { TicketNumber(it) }
}

@Converter
class ImdbIdConverter : AttributeConverter<IMDbID, String> {
  override fun convertToDatabaseColumn(attribute: IMDbID?): String? = attribute?.value
  override fun convertToEntityAttribute(dbData: String?): IMDbID? = dbData?.let { IMDbID.valueOf(it) }
}

@Converter
class TmdbIdConverter : AttributeConverter<TMDbID, Long> {
  override fun convertToDatabaseColumn(attribute: TMDbID?): Long? = attribute?.value
  override fun convertToEntityAttribute(dbData: Long?): TMDbID? = dbData?.let { TMDbID.valueOf(it) }
}

@Converter
class Base64IdConverter : AttributeConverter<Base64ID, String> {
  override fun convertToDatabaseColumn(attribute: Base64ID?): String? = attribute?.id
  override fun convertToEntityAttribute(dbData: String?): Base64ID? = dbData?.let { Base64ID(it) }
}

@Converter
class SekConverter : AttributeConverter<SEK, Long> {
  override fun convertToDatabaseColumn(attribute: SEK?): Long? = attribute?.ören
  override fun convertToEntityAttribute(dbData: Long?): SEK? = dbData?.let { SEK(it) }
}