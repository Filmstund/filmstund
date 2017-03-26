package rocks.didit.sefilm.database.converters

import rocks.didit.sefilm.domain.Imdb
import javax.persistence.AttributeConverter
import javax.persistence.Converter

@Converter(autoApply = true)
class ImdbTitleConverter : AttributeConverter<Imdb?, String?> {
    override fun convertToDatabaseColumn(attribute: Imdb?): String? {
        return attribute?.id
    }

    override fun convertToEntityAttribute(dbData: String?): Imdb? {
        if (dbData != null ) {
            return Imdb(dbData)
        }
        return null
    }
}