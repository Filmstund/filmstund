package rocks.didit.sefilm.services

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import org.springframework.core.io.ClassPathResource
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder
import org.springframework.stereotype.Service
import rocks.didit.sefilm.database.entities.Location
import rocks.didit.sefilm.database.repositories.LocationRepository
import rocks.didit.sefilm.domain.dto.FilmstadenCityAliasDTO
import java.util.*

@Service
class LocationService(private val locationRepo: LocationRepository) {
  fun allLocations() = locationRepo.findAll().toList()
  fun getLocation(name: String): Optional<Location> = locationRepo.findByNameIgnoreCaseOrAliasIgnoreCase(name, name)

  fun filmstadenCities(): List<FilmstadenCityAliasDTO> {
    val objectMapper: ObjectMapper = Jackson2ObjectMapperBuilder.json().build()

    val cityResource = ClassPathResource("[\n  {\n    \"name\": \"Alingsås\",\n    \"alias\": \"AL\"\n  },\n  {\n    \"name\": \"Borås\",\n    \"alias\": \"BS\"\n  },\n  {\n    \"name\": \"Borlänge\",\n    \"alias\": \"BO\"\n  },\n  {\n    \"name\": \"Eskilstuna\",\n    \"alias\": \"EA\"\n  },\n  {\n    \"name\": \"Falun\",\n    \"alias\": \"FN\"\n  },\n  {\n    \"name\": \"Gävle\",\n    \"alias\": \"GA\"\n  },\n  {\n    \"name\": \"Göteborg\",\n    \"alias\": \"GB\"\n  },\n  {\n    \"name\": \"Halmstad\",\n    \"alias\": \"HD\"\n  },\n  {\n    \"name\": \"Härnösand\",\n    \"alias\": \"HS\"\n  },\n  {\n    \"name\": \"Helsingborg\",\n    \"alias\": \"HE\"\n  },\n  {\n    \"name\": \"Höllviken\",\n    \"alias\": \"HV\"\n  },\n  {\n    \"name\": \"Hudiksvall\",\n    \"alias\": \"HL\"\n  },\n  {\n    \"name\": \"Jönköping\",\n    \"alias\": \"JO\"\n  },\n  {\n    \"name\": \"Kalmar\",\n    \"alias\": \"KL\"\n  },\n  {\n    \"name\": \"Karlskrona\",\n    \"alias\": \"KK\"\n  },\n  {\n    \"name\": \"Karlstad\",\n    \"alias\": \"KA\"\n  },\n  {\n    \"name\": \"Katrineholm\",\n    \"alias\": \"KM\"\n  },\n  {\n    \"name\": \"Köping\",\n    \"alias\": \"KP\"\n  },\n  {\n    \"name\": \"Kristianstad\",\n    \"alias\": \"KD\"\n  },\n  {\n    \"name\": \"Kungsbacka\",\n    \"alias\": \"KB\"\n  },\n  {\n    \"name\": \"Landskrona\",\n    \"alias\": \"LK\"\n  },\n  {\n    \"name\": \"Linköping\",\n    \"alias\": \"LI\"\n  },\n  {\n    \"name\": \"Luleå\",\n    \"alias\": \"LU\"\n  },\n  {\n    \"name\": \"Lund\",\n    \"alias\": \"LD\"\n  },\n  {\n    \"name\": \"Malmö\",\n    \"alias\": \"MA\"\n  },\n  {\n    \"name\": \"Mariestad\",\n    \"alias\": \"MD\"\n  },\n  {\n    \"name\": \"Mjölby\",\n    \"alias\": \"MJ\"\n  },\n  {\n    \"name\": \"Mora\",\n    \"alias\": \"MR\"\n  },\n  {\n    \"name\": \"Motala\",\n    \"alias\": \"ML\"\n  },\n  {\n    \"name\": \"Norrköping\",\n    \"alias\": \"NO\"\n  },\n  {\n    \"name\": \"Norrtälje\",\n    \"alias\": \"NT\"\n  },\n  {\n    \"name\": \"Nyköping\",\n    \"alias\": \"NG\"\n  },\n  {\n    \"name\": \"Örebro\",\n    \"alias\": \"OR\"\n  },\n  {\n    \"name\": \"Örnsköldsvik\",\n    \"alias\": \"OK\"\n  },\n  {\n    \"name\": \"Östersund\",\n    \"alias\": \"OS\"\n  },\n  {\n    \"name\": \"Sälen\",\n    \"alias\": \"SN\"\n  },\n  {\n    \"name\": \"Skara\",\n    \"alias\": \"SA\"\n  },\n  {\n    \"name\": \"Skellefteå\",\n    \"alias\": \"ST\"\n  },\n  {\n    \"name\": \"Skövde\",\n    \"alias\": \"SK\"\n  },\n  {\n    \"name\": \"Söderhamn\",\n    \"alias\": \"SH\"\n  },\n  {\n    \"name\": \"Stockholm\",\n    \"alias\": \"SE\"\n  },\n  {\n    \"name\": \"Strängnäs\",\n    \"alias\": \"SS\"\n  },\n  {\n    \"name\": \"Sundsvall\",\n    \"alias\": \"SU\"\n  },\n  {\n    \"name\": \"Trelleborg\",\n    \"alias\": \"TR\"\n  },\n  {\n    \"name\": \"Uddevalla\",\n    \"alias\": \"UD\"\n  },\n  {\n    \"name\": \"Umeå\",\n    \"alias\": \"UM\"\n  },\n  {\n    \"name\": \"Uppsala\",\n    \"alias\": \"UP\"\n  },\n  {\n    \"name\": \"Vänersborg\",\n    \"alias\": \"VG\"\n  },\n  {\n    \"name\": \"Värnamo\",\n    \"alias\": \"VR\"\n  },\n  {\n    \"name\": \"Västerås\",\n    \"alias\": \"VA\"\n  },\n  {\n    \"name\": \"Västervik\",\n    \"alias\": \"VS\"\n  },\n  {\n    \"name\": \"Växjö\",\n    \"alias\": \"VO\"\n  },\n  {\n    \"name\": \"Vetlanda\",\n    \"alias\": \"VL\"\n  },\n  {\n    \"name\": \"Visby\",\n    \"alias\": \"VY\"\n  },\n  {\n    \"name\": \"Ystad\",\n    \"alias\": \"YD\"\n  }\n]")
    return objectMapper.readValue(cityResource.inputStream)
  }

  fun getOrCreateNewLocation(name: String): Location {
    return locationRepo
      .findByNameIgnoreCaseOrAliasIgnoreCase(name, name)
      .orElseGet { locationRepo.save(Location(name = name)) }
  }
}