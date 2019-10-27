package se.filmstund.domain.dto

import java.time.LocalDate

@Deprecated(message = "User GiftCertificateDTO instead")
data class ForetagsbiljettDTO(
  val number: String,
  val expires: LocalDate = LocalDate.now().plusYears(1),
  val status: Status = Status.Unknown
) {
  enum class Status {
    Available, Pending, Used, Expired, Unknown
  }
}