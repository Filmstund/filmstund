import org.ajoberstar.grgit.Grgit
import org.gradle.api.tasks.Copy
import org.gradle.kotlin.dsl.*
import org.jetbrains.kotlin.gradle.tasks.KotlinCompile
import java.io.File
import java.time.*
import java.time.format.*

project.version = "1.1-SNAPSHOT"

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
  val kotlinVersion = "1.1.4"

  kotlin("jvm", version = kotlinVersion)
  kotlin("plugin.spring", version = kotlinVersion)
  id("org.ajoberstar.grgit") version "2.0.0-rc.1"
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
  compile("com.fasterxml.jackson.module:jackson-module-kotlin:2.9.0")
  compile("com.fasterxml.jackson.datatype:jackson-datatype-jsr310:2.9.0")
  compile("com.googlecode.libphonenumber:libphonenumber:8.4.2")
  compile("com.google.guava:guava:21.0")
  compile("org.jsoup:jsoup:1.10.3")
  testCompile("org.springframework.boot:spring-boot-starter-test:$springBootReleaseVersion")
}

tasks {
  fun addPipeToTheEndOfStr(value: Any, length: Int = 55): String {
    val strValue = value.toString()
    val strLen = strValue.length
    val times = Math.abs(length - strLen)
    return strValue +  " ".repeat(times-1) + "│"
  }
  "versionBanner" {
    doLast {
      val grgit = Grgit.open()
      val gitHead = grgit.head()
      val gitCommitId = addPipeToTheEndOfStr(gitHead.id)
      val gitCommitTime = addPipeToTheEndOfStr(gitHead.dateTime)
      val gitBranch = grgit.branch.current.name
      val now = addPipeToTheEndOfStr(ZonedDateTime.now())
      val projectNameAndBranch = addPipeToTheEndOfStr("${project.name} ($gitBranch)")
      val banner =
"""  ┌───────────────┬───────────────────────────────────────────────────────┐
  │ Project       │ $projectNameAndBranch
  ├───────────────┼───────────────────────────────────────────────────────┤
  │ Version       │ ${addPipeToTheEndOfStr(project.version)}
  │ Revision SHA  │ $gitCommitId
  │ Revision Date │ $gitCommitTime
  │ Build date    │ $now
  └───────────────┴───────────────────────────────────────────────────────┘"""
      val bannerFile = File("build/banner.txt")
      bannerFile.createNewFile()
      bannerFile.writeText(banner)
    }
  }

  "copyBanner"(Copy::class) {
    dependsOn("versionBanner")
    from("build/")
    include("banner.txt")
    into("build/resources/main")
  }
  "processResources" {
    dependsOn("copyBanner")
  }
}

