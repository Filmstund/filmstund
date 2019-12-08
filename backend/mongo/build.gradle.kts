dependencies {
  api(platform(rootProject))

  implementation(project(":database"))
  implementation(project(":api"))
  implementation("org.springframework.boot:spring-boot-starter-data-mongodb")

  implementation(kotlin("stdlib"))
}
