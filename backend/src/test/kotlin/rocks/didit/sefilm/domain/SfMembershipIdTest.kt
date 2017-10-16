package rocks.didit.sefilm.domain

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test

class SfMembershipIdTest {
  @Test
  fun testMaxLength() {
    val sfMembershipId = SfMembershipId("xxx-xxx")
    assertThat(sfMembershipId.value.length).isEqualTo(7)
    assertThat(sfMembershipId.value).isEqualTo("xxx-xxx")
  }

  @Test
  fun testMinLength() {
    val sfMembershipId = SfMembershipId("xxxxxx")
    assertThat(sfMembershipId.value.length).isEqualTo(6)
    assertThat(sfMembershipId.value).isEqualTo("xxxxxx")
  }

  @Test
  fun testTooShortLength() {
    val e = assertThrows(IllegalArgumentException::class.java, { SfMembershipId("12345") })
    assertThat(e).hasMessageContaining("The SF membership id has wrong size. Expected 6-7, got 5")
  }

  @Test
  fun testTooLongLength() {
    val e = assertThrows(IllegalArgumentException::class.java, { SfMembershipId("12345678") })
    assertThat(e).hasMessageContaining("The SF membership id has wrong size. Expected 6-7, got 8")
  }

  @Test
  fun testFormat() {
    val e = assertThrows(IllegalArgumentException::class.java, { SfMembershipId("123+456") })
    assertThat(e).hasMessageContaining("is an invalid membership id. Expected XXX-XXX")
  }

  @Test
  fun testValueOfWithoutDash() {
    val profileId = "asdfgh"
    val membershipId = SfMembershipId.valueOf(profileId)
    assertThat(membershipId.value).isEqualTo("asd-fgh")
  }

  @Test
  fun testValueOfWithDash() {
    val profileId = "asd-fgh"
    val membershipId = SfMembershipId.valueOf(profileId)
    assertThat(membershipId.value).isEqualTo("asd-fgh")
  }
}