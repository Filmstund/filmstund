package rocks.didit.sefilm.domain

import rocks.didit.sefilm.database.entities.User


data class LimitedUserInfo(
        val name: String? = null,
        val nick: String? = null,
        val phone: String? = null,
        val avatar: String? = null
)

fun User.toLimitedUserInfo(): LimitedUserInfo {
    return LimitedUserInfo(this.name, this.nick, this.phone, this.avatar)
}