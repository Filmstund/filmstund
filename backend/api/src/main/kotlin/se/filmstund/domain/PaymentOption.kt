package se.filmstund.domain

import se.filmstund.domain.dto.core.AttendeeDTO

data class PaymentOption(val type: AttendeeDTO.Type, val ticketNumber: String? = null)
