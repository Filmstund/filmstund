plugins {
  kotlin("jvm")
  id("org.jetbrains.kotlin.plugin.spring")
}

dependencies {
  api("com.googlecode.libphonenumber:libphonenumber:8.10.17")

  implementation(kotlin("stdlib"))
  implementation("org.springframework.boot:spring-boot-starter-web")
  implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
  implementation("com.google.guava:guava:28.1-jre")
  implementation("org.jdbi:jdbi3-core")

  testImplementation("org.springframework.boot:spring-boot-starter-test")
  testImplementation("org.junit.jupiter:junit-jupiter-api")
  testRuntimeOnly("org.junit.jupiter:junit-jupiter-engine")
}
