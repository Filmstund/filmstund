plugins {
  kotlin("jvm")
  id("org.jetbrains.kotlin.plugin.spring")
  id("org.jetbrains.kotlin.plugin.jpa")
}

dependencies {
  implementation(project(":api"))
  api("org.springframework.boot:spring-boot-starter-data-jpa")

  implementation(kotlin("stdlib"))
}
