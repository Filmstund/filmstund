import org.gradle.kotlin.dsl.*
import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

buildscript {
  val springBootSnapshotVersion = "2.0.0.M3"

  repositories {
    mavenCentral()
    maven { setUrl("https://plugins.gradle.org/m2/") }
    maven { setUrl("https://repo.spring.io/milestone") }
    maven { setUrl("https://repo.spring.io/snapshot") }
  }

  dependencies {
    classpath("org.springframework.boot:spring-boot-gradle-plugin:$springBootSnapshotVersion")
  }
}

plugins {
  val kotlinVersion = "1.1.3-2"

  kotlin("jvm", version = kotlinVersion)
  kotlin("plugin.spring", version = kotlinVersion)
}

apply {
  plugin("org.springframework.boot")
}

tasks.withType<KotlinCompile> {
  kotlinOptions {
    jvmTarget = "1.8"
  }
}

repositories {
  mavenCentral()
  maven { setUrl("https://repo.spring.io/milestone") }
  maven { setUrl("https://repo.spring.io/snapshot") }
}

val springBootSnapshotVersion = "2.0.0.M3"
val springBootReleaseVersion = "1.5.6.RELEASE"
dependencies {
  compile(group = "org.springframework.boot", name = "spring-boot-starter-web-services", version = springBootSnapshotVersion)
  compile(group = "org.springframework.boot", name = "spring-boot-starter-data-mongodb", version = springBootSnapshotVersion)
  compile(group = "org.springframework.boot", name = "spring-boot-starter-cache", version = springBootSnapshotVersion)
  compile(group = "org.springframework.boot", name = "spring-boot-starter-security", version = springBootSnapshotVersion)
  compile(group = "org.springframework.security", name = "spring-security-jwt", version = "1.0.8.RELEASE")
  compile(group = "org.springframework.security.oauth", name = "spring-security-oauth2", version = "2.2.0.RELEASE")
  compile(group = "org.springframework.session", name = "spring-session-data-mongodb", version = "2.0.0.M2")
  compile(group = "org.springframework.session", name = "spring-session-core", version = springBootSnapshotVersion)
  compile(group = "com.github.ben-manes.caffeine", name = "caffeine", version = "2.+")
  compile(kotlin("stdlib"))
  compile(kotlin("stdlib-jre8"))
  compile(kotlin("reflect"))
  compile("com.fasterxml.jackson.module:jackson-module-kotlin")
  compile("com.fasterxml.jackson.datatype:jackson-datatype-jsr310")
  compile("com.googlecode.libphonenumber:libphonenumber:8.4.2")
  compile("com.google.guava:guava:21.0")
  compile("org.jsoup:jsoup:1.10.3")
  testCompile("org.springframework.boot:spring-boot-starter-test:$springBootReleaseVersion")
}
