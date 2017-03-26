package rocks.didit.sefilm.database.converters

import rocks.didit.sefilm.domain.ImdbTitle
import javax.persistence.AttributeConverter
import javax.persistence.Converter

@Converter(autoApply = true)
class ImdbTitleConverter : AttributeConverter<ImdbTitle?, String?> {
    override fun convertToDatabaseColumn(attribute: ImdbTitle?): String? {
        return attribute?.id
    }

    override fun convertToEntityAttribute(dbData: String?): ImdbTitle? {
        if (dbData != null ) {
            return ImdbTitle(dbData)
        }
        return null
    }
}