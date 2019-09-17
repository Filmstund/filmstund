package rocks.didit.sefilm.domain.dto

import java.time.LocalDate

data class ForetagsbiljettDTO(
  val number: String,
  val expires: LocalDate = LocalDate.now().plusYears(1),
  val status: Status = Status.Unknown
) {
  enum class Status {
    Available, Pending, Used, Expired, Unknown
  }
}

data class UserDetailsDTO(val nick: String?, val phone: String?, val filmstadenMembershipId: String?)