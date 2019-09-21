package rocks.didit.sefilm.database

import org.jdbi.v3.core.argument.AbstractArgumentFactory
import org.jdbi.v3.core.argument.Argument
import org.jdbi.v3.core.config.ConfigRegistry
import org.jdbi.v3.core.mapper.ColumnMapper
import org.jdbi.v3.core.statement.StatementContext
import rocks.didit.sefilm.domain.FilmstadenMembershipId
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
