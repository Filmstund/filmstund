package se.filmstund.domain.dto

sealed class ResponseStatusDTO(val success: Boolean) {
  class SuccessfulStatusDTO(val message: String = "") : ResponseStatusDTO(true)
  class FailStatusDTO(val message: String = "") : ResponseStatusDTO(false)
}


