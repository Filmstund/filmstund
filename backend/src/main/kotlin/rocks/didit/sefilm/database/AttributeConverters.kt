@file:Suppress("unused")

package rocks.didit.sefilm.database

import rocks.didit.sefilm.domain.*
import javax.persistence.AttributeConverter
import javax.persistence.Converter

@Converter
class UserIdConverter : AttributeConverter<UserID, String> {
  override fun convertToDatabaseColumn(attribute: UserID?): String? = attribute?.id
  override fun convertToEntityAttribute(dbData: String?): UserID? = dbData?.let { UserID(it) }
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
