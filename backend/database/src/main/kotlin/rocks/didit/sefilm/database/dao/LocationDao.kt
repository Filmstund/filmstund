package rocks.didit.sefilm.database.dao

import org.jdbi.v3.sqlobject.customizer.BindBean
import org.jdbi.v3.sqlobject.statement.SqlBatch
import org.jdbi.v3.sqlobject.statement.SqlQuery
import org.jdbi.v3.sqlobject.statement.SqlUpdate
import org.jdbi.v3.sqlobject.statement.UseRowReducer
import rocks.didit.sefilm.database.LocationAliasReducer
import rocks.didit.sefilm.domain.dto.LocationDTO

interface LocationDao {

  @SqlQuery("SELECT l.*, la.alias AS laalias FROM location l LEFT JOIN location_alias la ON l.name = la.location")
  @UseRowReducer(LocationAliasReducer::class)
  fun findAll(): List<LocationDTO>

  @SqlQuery("SELECT l.*, la.alias AS laalias FROM location l LEFT JOIN location_alias la ON l.name = la.location WHERE upper(l.name) = upper(:name) OR l.name = (SELECT location FROM location_alias al WHERE upper(al.alias) = upper(:name))")
  @UseRowReducer(LocationAliasReducer::class)
  fun findByNameOrAlias(name: String): LocationDTO?

  @SqlUpdate("INSERT INTO location (name, city_alias, city, street_address, postal_code, postal_address, latitude, longitude, filmstaden_id) VALUES (:name, :cityAlias, :city, :streetAddress, :postalCode, :postalAddress, :latitude, :longitude, :filmstadenId)")
  fun insertLocation(@BindBean location: LocationDTO)

  @SqlBatch("INSERT INTO location_alias (location, alias) VALUES (:locationName, :alias)")
  fun insertAlias(locationName: String, alias: List<String>): IntArray

  fun insertAlias(locationName: String, alias: String) = insertAlias(locationName, listOf(alias))
}