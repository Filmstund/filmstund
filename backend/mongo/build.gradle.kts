plugins {
  kotlin("jvm")
  id("org.jetbrains.kotlin.plugin.spring")
}

dependencies {
  implementation(project(":database"))
  implementation(project(":api"))
  implementation("org.springframework.boot:spring-boot-starter-data-mongodb")

  implementation(kotlin("stdlib"))
}
