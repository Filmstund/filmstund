package rocks.didit.sefilm.database.entities

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import java.math.BigDecimal
import java.util.*

@Document
data class Location(
        @Id
        val id: UUID = UUID.randomUUID(),
        val name: String? = null,
        val latitude: BigDecimal? = null,
        val longitude: BigDecimal? = null)