plugins {
  kotlin("jvm")
  id("org.jetbrains.kotlin.plugin.spring")
}

dependencies {
  implementation(project(":api"))
  api("org.springframework:spring-context")
  api("org.springframework:spring-tx")
  api("org.springframework.boot:spring-boot-starter-jdbc")
  api("org.jdbi:jdbi3-core")
  api("org.jdbi:jdbi3-kotlin")
  api("org.jdbi:jdbi3-kotlin-sqlobject")
  api("org.jdbi:jdbi3-postgres")


  implementation(kotlin("stdlib"))
}
