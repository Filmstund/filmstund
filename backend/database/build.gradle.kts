plugins {
  kotlin("jvm")
  id("org.jetbrains.kotlin.plugin.spring")
  id("org.jetbrains.kotlin.plugin.jpa")
}

dependencies {
  implementation(project(":api"))
  api("org.springframework.boot:spring-boot-starter-data-jpa")
  api("org.jdbi:jdbi3-core")
  api("org.jdbi:jdbi3-kotlin")
  api("org.jdbi:jdbi3-kotlin-sqlobject")
  api("org.jdbi:jdbi3-postgres")


  implementation(kotlin("stdlib"))
}
