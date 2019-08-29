package rocks.didit.sefilm.domain.dto

import rocks.didit.sefilm.domain.Foretagsbiljett
import java.time.LocalDate

data class ForetagsbiljettDTO(
  val number: String,
  val expires: LocalDate = LocalDate.now().plusYears(1),
  val status: Foretagsbiljett.Status?
)

data class UserDetailsDTO(val nick: String?, val phone: String?, val filmstadenMembershipId: String?)