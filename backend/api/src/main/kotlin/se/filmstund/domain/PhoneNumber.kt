package se.filmstund.domain

import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonValue
import com.google.i18n.phonenumbers.NumberParseException
import com.google.i18n.phonenumbers.PhoneNumberUtil
import com.google.i18n.phonenumbers.PhoneNumberUtil.PhoneNumberType.MOBILE
import com.google.i18n.phonenumbers.Phonenumber

data class PhoneNumber(var number: String = "") {
  companion object {
    @JsonCreator
    @JvmStatic
    fun from(str: String?) = str?.let { PhoneNumber(parsePhoneNumber(it)) }

    private fun parsePhoneNumber(number: String): String {
      val phoneUtil = PhoneNumberUtil.getInstance()
      val parsedPhoneNumber: Phonenumber.PhoneNumber
      try {
        parsedPhoneNumber = phoneUtil.parse(number, "SE")
      } catch (e: NumberParseException) {
        throw IllegalArgumentException("'$number' is not a valid Swedish phone number")
      }

      val numberType = phoneUtil.getNumberType(parsedPhoneNumber)
      require(numberType == MOBILE) { "'$number' is not a mobile number. Got: $numberType type" }

      return phoneUtil.format(parsedPhoneNumber, PhoneNumberUtil.PhoneNumberFormat.NATIONAL)
    }
  }

  init {
    if (this.number.isNotBlank()) {
      this.number = parsePhoneNumber(this.number)
    }
  }

  @JsonValue
  override fun toString(): String {
    return number
  }
}