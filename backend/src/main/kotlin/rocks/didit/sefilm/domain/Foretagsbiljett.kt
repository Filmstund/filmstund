package rocks.didit.sefilm.domain

import java.time.LocalDate

enum class ForetagsbiljettStatus {
  Available, Pending, Used
}

data class Foretagsbiljett(val value: String,
                           val status: ForetagsbiljettStatus = ForetagsbiljettStatus.Available,
                           val expires: LocalDate = LocalDate.now().plusYears(1)) {
  init {
    if (value.length != 11) {
      throw IllegalArgumentException("Företagsbiljett has wrong size. Expected 11, got ${value.length}")
    }
    if (value.toLongOrNull() == null) {
      throw IllegalArgumentException("'$value' is an invalid företagsbiljett")
    }
  }
}