package rocks.didit.sefilm.database.dao

import org.jdbi.v3.sqlobject.customizer.BindBean
import org.jdbi.v3.sqlobject.kotlin.RegisterKotlinMapper
import org.jdbi.v3.sqlobject.statement.SqlBatch
import org.jdbi.v3.sqlobject.statement.SqlQuery
import org.jdbi.v3.sqlobject.statement.UseRowReducer
import rocks.didit.sefilm.database.LocationAliasReducer
import rocks.didit.sefilm.domain.dto.core.LocationDTO

interface LocationDao {
  companion object {
    const val SELECTABLE_FIELDS: String =
      "l.name l_name, l.city_alias l_cityAlias, l.city l_city, l.street_address l_streetAddress, l.postal_code l_postalCode, l.postal_address l_postalAddress, l.latitude l_latitude, l.longitude l_longitude, l.filmstaden_id l_filmstadenId, l.last_modified_date l_lastModifiedDate"
  }

  @SqlQuery("SELECT count(1) FROM location")
  fun count(): Int

  @SqlQuery("SELECT exists(SELECT 1 FROM location where name = :name)")
  fun existsByName(name: String): Boolean

  @SqlQuery("SELECT ${SELECTABLE_FIELDS}, la.alias AS la_alias FROM location l LEFT JOIN location_alias la ON l.name = la.location")
  @UseRowReducer(LocationAliasReducer::class)
  @RegisterKotlinMapper(LocationDTO::class, "l")
  fun findAll(): List<LocationDTO>

  @SqlQuery("SELECT ${SELECTABLE_FIELDS}, la.alias AS la_alias FROM location l LEFT JOIN location_alias la ON l.name = la.location WHERE upper(l.name) = upper(:name) OR l.name = (SELECT location FROM location_alias al WHERE upper(al.alias) = upper(:name))")
  @UseRowReducer(LocationAliasReducer::class)
  @RegisterKotlinMapper(LocationDTO::class, "l")
  fun findByNameOrAlias(name: String): LocationDTO?

  @SqlBatch("INSERT INTO location (name, city_alias, city, street_address, postal_code, postal_address, latitude, longitude, filmstaden_id) VALUES (:name, :cityAlias, :city, :streetAddress, :postalCode, :postalAddress, :latitude, :longitude, :filmstadenId)")
  fun insertLocations(@BindBean location: List<LocationDTO>)

  fun insertLocation(location: LocationDTO) = insertLocations(listOf(location))

  fun insertLocationAndAlias(location: LocationDTO) {
    insertLocations(listOf(location))
    insertAlias(location.name, location.alias)
  }

  @SqlBatch("INSERT INTO location_alias (location, alias) VALUES (:locationName, :alias)")
  fun insertAlias(locationName: String, alias: List<String>): IntArray

  fun insertAlias(locationName: String, alias: String) = insertAlias(locationName, listOf(alias))
}