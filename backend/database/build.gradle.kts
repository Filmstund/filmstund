plugins {
  kotlin("jvm")
  id("org.jetbrains.kotlin.plugin.spring")
  id("org.jetbrains.kotlin.plugin.jpa")
}

dependencies {
  implementation(project(":api"))
  api("org.springframework.boot:spring-boot-starter-data-jpa")
  val jdbiVersion = "3.10.1"
  api("org.jdbi:jdbi3-core:$jdbiVersion")
  api("org.jdbi:jdbi3-kotlin:$jdbiVersion")
  api("org.jdbi:jdbi3-kotlin-sqlobject:$jdbiVersion")


  implementation(kotlin("stdlib"))
}
