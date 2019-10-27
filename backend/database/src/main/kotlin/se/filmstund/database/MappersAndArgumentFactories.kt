package se.filmstund.database

import org.jdbi.v3.core.argument.AbstractArgumentFactory
import org.jdbi.v3.core.argument.Argument
import org.jdbi.v3.core.config.ConfigRegistry
import org.jdbi.v3.core.mapper.ColumnMapper
import org.jdbi.v3.core.statement.StatementContext
import se.filmstund.domain.Nick
import se.filmstund.domain.PhoneNumber
import se.filmstund.domain.SEK
import se.filmstund.domain.id.Base64ID
import se.filmstund.domain.id.CalendarFeedID
import se.filmstund.domain.id.FilmstadenMembershipId
import se.filmstund.domain.id.FilmstadenNcgID
import se.filmstund.domain.id.FilmstadenShowingID
import se.filmstund.domain.id.GoogleId
import se.filmstund.domain.id.IMDbID
import se.filmstund.domain.id.MovieID
import se.filmstund.domain.id.ShowingID
import se.filmstund.domain.id.TMDbID
import se.filmstund.domain.id.TicketNumber
import se.filmstund.domain.id.UserID
import java.math.BigDecimal
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
      val value: BigDecimal? = it.getBigDecimal(columnNumber)
      return value?.let { id -> TMDbID(id.toLong()) }
    }
  }
}

class TMDbIDArgumentFactory : AbstractArgumentFactory<TMDbID>(Types.BIGINT) {
  override fun build(value: TMDbID?, config: ConfigRegistry?): Argument {
    return Argument { position, statement, _ ->
      statement.setBigDecimal(
        position,
        value?.value?.let { BigDecimal(it) })
    }
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

class ShowingIdColumnMapper : ColumnMapper<ShowingID> {
  override fun map(r: ResultSet?, columnNumber: Int, ctx: StatementContext?): ShowingID? {
    return r?.let {
      val uuid = it.getObject(columnNumber, UUID::class.java)
        ?: return null
      return ShowingID(uuid)
    }
  }
}

class ShowingIdArgumentFactory : AbstractArgumentFactory<ShowingID>(Types.OTHER) {
  override fun build(value: ShowingID?, config: ConfigRegistry?): Argument {
    return Argument { position, statement, _ -> statement.setObject(position, value?.id) }
  }
}

class FilmstadenShowingIdColumnMapper : ColumnMapper<FilmstadenShowingID> {
  override fun map(r: ResultSet?, columnNumber: Int, ctx: StatementContext?): FilmstadenShowingID? {
    return r?.let {
      val value = it.getString(columnNumber)
      return FilmstadenShowingID.from(value)
    }
  }
}

class FilmstadenShowingIdArgumentFactory : AbstractArgumentFactory<FilmstadenShowingID>(Types.VARCHAR) {
  override fun build(value: FilmstadenShowingID?, config: ConfigRegistry?): Argument {
    return Argument { position, statement, _ -> statement.setString(position, value?.value) }
  }
}

class CalendarFeedIdColumnMapper : ColumnMapper<CalendarFeedID> {
  override fun map(r: ResultSet?, columnNumber: Int, ctx: StatementContext?): CalendarFeedID? {
    return r?.let {
      val uuid = it.getObject(columnNumber, UUID::class.java)
        ?: return null
      return CalendarFeedID(uuid)
    }
  }
}

class CalendarFeedIdArgumentFactory : AbstractArgumentFactory<CalendarFeedID>(Types.OTHER) {
  override fun build(value: CalendarFeedID?, config: ConfigRegistry?): Argument {
    return Argument { position, statement, _ -> statement.setObject(position, value?.uuid) }
  }
}

class NickColumnMapper : ColumnMapper<Nick> {
  override fun map(r: ResultSet?, columnNumber: Int, ctx: StatementContext?): Nick? {
    return r?.let {
      val value: String = it.getString(columnNumber) ?: return null
      return Nick(value)
    }
  }
}

class NickArgumentFactory : AbstractArgumentFactory<Nick>(Types.VARCHAR) {
  override fun build(value: Nick?, config: ConfigRegistry?): Argument {
    return Argument { position, statement, _ -> statement.setString(position, value.toString()) }
  }
}

