package rocks.didit.sefilm.database

import org.jdbi.v3.core.argument.AbstractArgumentFactory
import org.jdbi.v3.core.argument.Argument
import org.jdbi.v3.core.config.ConfigRegistry
import org.jdbi.v3.core.mapper.ColumnMapper
import org.jdbi.v3.core.statement.StatementContext
import rocks.didit.sefilm.domain.PhoneNumber
import rocks.didit.sefilm.domain.SEK
import rocks.didit.sefilm.domain.id.Base64ID
import rocks.didit.sefilm.domain.id.FilmstadenMembershipId
import rocks.didit.sefilm.domain.id.FilmstadenNcgID
import rocks.didit.sefilm.domain.id.GoogleId
import rocks.didit.sefilm.domain.id.IMDbID
import rocks.didit.sefilm.domain.id.MovieID
import rocks.didit.sefilm.domain.id.TMDbID
import rocks.didit.sefilm.domain.id.TicketNumber
import rocks.didit.sefilm.domain.id.UserID
import java.sql.ResultSet
import java.sql.Types
import java.util.*

class FilmstadenMembershipIdColumnMapper : ColumnMapper<FilmstadenMembershipId> {
  override fun map(r: ResultSet?, columnNumber: Int, ctx: StatementContext?): FilmstadenMembershipId? {
    return r?.let {
      val value: String = it.getString(columnNumber) ?: return null
      return FilmstadenMembershipId(value)
    }
  }
}

class FilmstadenMembershipArgumentFactory : AbstractArgumentFactory<FilmstadenMembershipId>(Types.VARCHAR) {
  override fun build(value: FilmstadenMembershipId?, config: ConfigRegistry?): Argument {
    return Argument { position, statement, _ -> statement.setString(position, value.toString()) }
  }
}

class TicketNumberColumnMapper : ColumnMapper<TicketNumber> {
  override fun map(r: ResultSet?, columnNumber: Int, ctx: StatementContext?): TicketNumber? {
    return r?.let {
      val value: String = it.getString(columnNumber) ?: return null
      return TicketNumber(value)
    }
  }
}

class TicketNumberArgumentFactory : AbstractArgumentFactory<TicketNumber>(Types.VARCHAR) {
  override fun build(value: TicketNumber?, config: ConfigRegistry?): Argument {
    return Argument { position, statement, _ -> statement.setString(position, value.toString()) }
  }
}

class GoogleIdColumnMapper : ColumnMapper<GoogleId> {
  override fun map(r: ResultSet?, columnNumber: Int, ctx: StatementContext?): GoogleId? {
    return r?.let {
      val value: String = it.getString(columnNumber) ?: return null
      return GoogleId(value)
    }
  }
}

class GoogleIdArgumentFactory : AbstractArgumentFactory<GoogleId>(Types.VARCHAR) {
  override fun build(value: GoogleId?, config: ConfigRegistry?): Argument {
    return Argument { position, statement, _ -> statement.setString(position, value.toString()) }
  }
}

class PhoneNumberColumnMapper : ColumnMapper<PhoneNumber> {
  override fun map(r: ResultSet?, columnNumber: Int, ctx: StatementContext?): PhoneNumber? {
    return r?.let {
      val value: String = it.getString(columnNumber) ?: return null
      return PhoneNumber(value)
    }
  }
}

class PhoneNumberArgumentFactory : AbstractArgumentFactory<PhoneNumber>(Types.VARCHAR) {
  override fun build(value: PhoneNumber?, config: ConfigRegistry?): Argument {
    return Argument { position, statement, _ -> statement.setString(position, value.toString()) }
  }
}

class IMDbIDColumnMapper : ColumnMapper<IMDbID> {
  override fun map(r: ResultSet?, columnNumber: Int, ctx: StatementContext?): IMDbID? {
    return r?.let {
      val value: String = it.getString(columnNumber) ?: return null
      return IMDbID(value)
    }
  }
}

class IMDbIDArgumentFactory : AbstractArgumentFactory<IMDbID>(Types.VARCHAR) {
  override fun build(value: IMDbID?, config: ConfigRegistry?): Argument {
    return Argument { position, statement, _ -> statement.setString(position, value?.value) }
  }
}

class TMDbIDColumnMapper : ColumnMapper<TMDbID> {
  override fun map(r: ResultSet?, columnNumber: Int, ctx: StatementContext?): TMDbID? {
    return r?.let {
      val value: Long = it.getLong(columnNumber)
      return TMDbID(value)
    }
  }
}

class TMDbIDArgumentFactory : AbstractArgumentFactory<TMDbID>(Types.BIGINT) {
  override fun build(value: TMDbID?, config: ConfigRegistry?): Argument {
    return Argument { position, statement, _ -> statement.setLong(position, value?.value ?: 0L) }
  }
}

class Base64IDColumnMapper : ColumnMapper<Base64ID> {
  override fun map(r: ResultSet?, columnNumber: Int, ctx: StatementContext?): Base64ID? {
    return r?.let {
      val value: String = it.getString(columnNumber) ?: return null
      return Base64ID(value)
    }
  }
}

class Base64IDArgumentFactory : AbstractArgumentFactory<Base64ID>(Types.VARCHAR) {
  override fun build(value: Base64ID?, config: ConfigRegistry?): Argument {
    return Argument { position, statement, _ -> statement.setString(position, value?.id) }
  }
}

class SEKColumnMapper : ColumnMapper<SEK> {
  override fun map(r: ResultSet?, columnNumber: Int, ctx: StatementContext?): SEK? {
    return r?.let {
      val value: Long = it.getLong(columnNumber)
      return SEK(value)
    }
  }
}

class SEKArgumentFactory : AbstractArgumentFactory<SEK>(Types.INTEGER) {
  override fun build(value: SEK?, config: ConfigRegistry?): Argument {
    return Argument { position, statement, _ -> statement.setLong(position, value?.ören ?: 0L) }
  }
}

class UserIdColumnMapper : ColumnMapper<UserID> {
  override fun map(r: ResultSet?, columnNumber: Int, ctx: StatementContext?): UserID? {
    return r?.let {
      val uuid = it.getObject(columnNumber, UUID::class.java)
        ?: return null
      return UserID(uuid)
    }
  }
}

class UserIdArgumentFactory : AbstractArgumentFactory<UserID>(Types.OTHER) {
  override fun build(value: UserID?, config: ConfigRegistry?): Argument {
    return Argument { position, statement, _ -> statement.setObject(position, value?.id) }
  }
}

class MovieIdColumnMapper : ColumnMapper<MovieID> {
  override fun map(r: ResultSet?, columnNumber: Int, ctx: StatementContext?): MovieID? {
    return r?.let {
      val uuid = it.getObject(columnNumber, UUID::class.java)
        ?: return null
      return MovieID(uuid)
    }
  }
}

class MovieIdArgumentFactory : AbstractArgumentFactory<MovieID>(Types.OTHER) {
  override fun build(value: MovieID?, config: ConfigRegistry?): Argument {
    return Argument { position, statement, _ -> statement.setObject(position, value?.id) }
  }
}

class FilmstadenNcgIdColumnMapper : ColumnMapper<FilmstadenNcgID> {
  override fun map(r: ResultSet?, columnNumber: Int, ctx: StatementContext?): FilmstadenNcgID? {
    return r?.let {
      val value = it.getString(columnNumber)
      return FilmstadenNcgID.from(value)
    }
  }
}

class FilmstadenNcgIdArgumentFactory : AbstractArgumentFactory<FilmstadenNcgID>(Types.VARCHAR) {
  override fun build(value: FilmstadenNcgID?, config: ConfigRegistry?): Argument {
    return Argument { position, statement, _ -> statement.setString(position, value?.ncgId) }
  }
}
