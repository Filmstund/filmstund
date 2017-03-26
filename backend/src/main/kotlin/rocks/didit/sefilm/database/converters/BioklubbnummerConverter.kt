package rocks.didit.sefilm.database.converters

import rocks.didit.sefilm.domain.Bioklubbnummer
import javax.persistence.AttributeConverter
import javax.persistence.Converter

@Converter(autoApply = true)
class BioklubbnummerConverter : AttributeConverter<Bioklubbnummer, String> {
    override fun convertToEntityAttribute(dbData: String?): Bioklubbnummer {
        if (dbData == null) {
            throw NullPointerException("Bioklubbnummer db data may not be null")
        }
        return Bioklubbnummer(dbData)
    }

    override fun convertToDatabaseColumn(attribute: Bioklubbnummer?): String {
        if (attribute == null) {
            throw NullPointerException("Attribute bioklubbnummer may not be null")
        }
        return attribute.value
    }
}