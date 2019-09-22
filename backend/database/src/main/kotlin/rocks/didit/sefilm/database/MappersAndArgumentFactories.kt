package rocks.didit.sefilm.database

import org.jdbi.v3.core.argument.AbstractArgumentFactory
import org.jdbi.v3.core.argument.Argument
import org.jdbi.v3.core.config.ConfigRegistry
import org.jdbi.v3.core.mapper.ColumnMapper
import org.jdbi.v3.core.statement.StatementContext
import rocks.didit.sefilm.domain.FilmstadenMembershipId
import rocks.didit.sefilm.domain.GoogleId
import rocks.didit.sefilm.domain.IMDbID
import rocks.didit.sefilm.domain.PhoneNumber
import rocks.didit.sefilm.domain.TMDbID
import rocks.didit.sefilm.domain.TicketNumber
import java.sql.ResultSet
import java.sql.Types

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
