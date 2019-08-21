package rocks.didit.sefilm.domain

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test

class FilmstadenMembershipIdTest {
    @Test
    fun testMaxLength() {
        val filmstadenMembershipId = FilmstadenMembershipId("xxx-xxx")
        assertThat(filmstadenMembershipId.value.length).isEqualTo(7)
        assertThat(filmstadenMembershipId.value).isEqualTo("xxx-xxx")
    }

    @Test
    fun testMinLength() {
        val filmstadenMembershipId = FilmstadenMembershipId("xxxxxx")
        assertThat(filmstadenMembershipId.value.length).isEqualTo(6)
        assertThat(filmstadenMembershipId.value).isEqualTo("xxxxxx")
    }

    @Test
    fun testTooShortLength() {
        val e = assertThrows(IllegalArgumentException::class.java) { FilmstadenMembershipId("12345") }
        assertThat(e).hasMessageContaining("The Filmstaden membership id has wrong size. Expected 6-7, got 5")
    }

    @Test
    fun testTooLongLength() {
        val e = assertThrows(IllegalArgumentException::class.java) { FilmstadenMembershipId("12345678") }
        assertThat(e).hasMessageContaining("The Filmstaden membership id has wrong size. Expected 6-7, got 8")
    }

    @Test
    fun testFormat() {
        val e = assertThrows(IllegalArgumentException::class.java) { FilmstadenMembershipId("123+456") }
        assertThat(e).hasMessageContaining("is an invalid membership id. Expected XXX-XXX")
    }

    @Test
    fun testValueOfWithoutDash() {
        val profileId = "asdfgh"
        val membershipId = FilmstadenMembershipId.valueOf(profileId)
        assertThat(membershipId.value).isEqualTo("asd-fgh")
    }

    @Test
    fun testValueOfWithDash() {
        val profileId = "asd-fgh"
        val membershipId = FilmstadenMembershipId.valueOf(profileId)
        assertThat(membershipId.value).isEqualTo("asd-fgh")
    }
}