rootProject.name = "filmstund"

pluginManagement {
  val kotlinVersion: String by settings
  val springBootVersion: String by settings
  val grgitVersion: String by settings
  val jibVersion: String by settings
  val versionsVersion: String by settings
  val gradleGitPropsVersion: String by settings

  plugins {
    kotlin("jvm") version kotlinVersion
    id("org.jetbrains.kotlin.plugin.spring") version kotlinVersion
    id("org.springframework.boot") version springBootVersion
    id("org.ajoberstar.grgit") version grgitVersion
    id("com.google.cloud.tools.jib") version jibVersion
    id("com.github.ben-manes.versions") version versionsVersion
    id("com.gorylenko.gradle-git-properties") version gradleGitPropsVersion
  }
}

include("api", "database", "mongo", "app")
