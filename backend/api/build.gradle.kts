dependencies {
  api(platform(rootProject))

  api("com.googlecode.libphonenumber:libphonenumber")

  implementation(kotlin("stdlib"))
  implementation("org.springframework.boot:spring-boot-starter-web")
  implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
  implementation("com.google.guava:guava")
  implementation("org.jdbi:jdbi3-core")

  testImplementation("org.springframework.boot:spring-boot-starter-test")
  testImplementation("org.junit.jupiter:junit-jupiter-api")
  testRuntimeOnly("org.junit.jupiter:junit-jupiter-engine")
}
