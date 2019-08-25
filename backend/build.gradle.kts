import org.ajoberstar.grgit.Grgit
import org.jetbrains.kotlin.gradle.tasks.KotlinCompile
import java.time.ZonedDateTime
import kotlin.math.abs

repositories {
  mavenCentral()
  gradlePluginPortal()
}

plugins {
  val kotlinVersion = "1.3.50"
  kotlin("jvm") version kotlinVersion
  id("org.jetbrains.kotlin.plugin.spring") version kotlinVersion apply true
  //id("org.jetbrains.kotlin.plugin.jpa") version kotlinVersion
  id("org.springframework.boot") version "2.1.7.RELEASE"
  id("io.spring.dependency-management") version "1.0.8.RELEASE" apply true
  id("org.ajoberstar.grgit") version "3.1.1" apply true
  id("net.researchgate.release") version "2.8.1"
  id("com.google.cloud.tools.jib") version "1.5.1"
  id("com.github.ben-manes.versions") version "0.22.0"
}

tasks.withType<KotlinCompile> {
  kotlinOptions {
      jvmTarget = "1.8"
      freeCompilerArgs = listOf("-Xjsr305=strict")
  }
}

tasks.withType<Test> {
  useJUnitPlatform()
}

dependencies {
  compile("com.graphql-java:graphql-spring-boot-starter:5.0.2")
//  UI for GraphQL queries available at /graphiql
//  compile("com.graphql-java:graphiql-spring-boot-starter:5.0.2")
  compile("com.graphql-java:graphql-java-tools:5.2.4")
  compile("com.graphql-java:graphql-java:9.4")
  compile("org.springframework.boot:spring-boot-starter-web-services")
  compile("org.springframework.boot:spring-boot-starter-logging")
  compile("org.springframework.boot:spring-boot-starter-data-mongodb")
  compile("org.springframework.boot:spring-boot-starter-cache")
  compile("org.springframework.boot:spring-boot-starter-security")
  compile("org.springframework.boot:spring-boot-starter-mustache")
  compile("org.springframework.security:spring-security-jwt:1.0.10.RELEASE")
  compile("org.springframework.security.oauth:spring-security-oauth2:2.3.6.RELEASE")
  compile("org.springframework.boot:spring-boot-devtools")


  /* The below is fix for kotlin-reflect in 1.2.20 */
  compile("org.springframework.data:spring-data-mongodb")
  compile("org.springframework.data:spring-data-commons")

  compile("com.github.ben-manes.caffeine:caffeine:2.+")
  compile("com.fasterxml.jackson.module:jackson-module-kotlin:2.9.+")
  compile("com.fasterxml.jackson.datatype:jackson-datatype-jsr310:2.9.+")
  compile("com.googlecode.libphonenumber:libphonenumber:8.10.17")
  compile("com.google.guava:guava:28.0-jre")
  compile("net.sf.biweekly:biweekly:0.6.3")

  /* The following are needed under java 11 */
  runtime("org.apache.commons:commons-lang3:3.9")
  runtime("javax.xml.bind:jaxb-api:2.3.0")
  runtime("com.sun.xml.bind:jaxb-impl:2.3.0")
  runtime("com.sun.xml.bind:jaxb-core:2.3.0")
  runtime("javax.activation:activation:1.1")
  compile("org.apache.httpcomponents:httpclient:4.5.9")

  implementation(kotlin("stdlib-jdk8"))
  implementation(kotlin("stdlib"))
  implementation(kotlin("reflect"))

  testCompile("org.springframework.boot:spring-boot-starter-test")
  testImplementation("org.junit.jupiter:junit-jupiter-api")
  testRuntimeOnly("org.junit.jupiter:junit-jupiter-engine")
  testCompile("org.mockito:mockito-core:3.0.0")
}

tasks.register("versionBanner") {
  fun addPipeToTheEndOfStr(value: Any): String {
    val strValue = value.toString()
    val strLen = strValue.length
    val times = abs(55 - strLen)
    return strValue + " ".repeat(times - 1) + "│"
  }

    doLast {
      val git = Grgit.open(mapOf("currentDir" to project.rootDir))
      val gitHead = git.head()
      val gitCommitId = addPipeToTheEndOfStr(gitHead.id)
      val gitCommitTime = addPipeToTheEndOfStr(gitHead.dateTime)
      val gitBranch = git.branch.current().name
      val now = addPipeToTheEndOfStr(ZonedDateTime.now())
      val projectNameAndBranch = addPipeToTheEndOfStr("${project.name} ($gitBranch)")
      val projectVersion = addPipeToTheEndOfStr(version)
      val banner =
"  ┌───────────────┬───────────────────────────────────────────────────────┐\n" +
"  │ Project       │ $projectNameAndBranch\n" +
"  ├───────────────┼───────────────────────────────────────────────────────┤\n"+
"  │ Version       │ $projectVersion\n"+
"  │ Revision SHA  │ $gitCommitId\n"+
"  │ Revision Date │ $gitCommitTime\n"+
"  │ Build date    │ $now\n"+
"  └───────────────┴───────────────────────────────────────────────────────┘"
      val bannerFile = File("build/banner.txt")
      bannerFile.createNewFile()
      bannerFile.writeText(banner, Charsets.UTF_8)
    }
  }

tasks.register("copyBanner", Copy::class) {
  dependsOn("versionBanner")
  from("build/")
  include("banner.txt")
  into("build/resources/main")
}

tasks.named("processResources") {
  dependsOn("copyBanner")
}

release {
  preTagCommitMessage = "[Release] - Prepare release: "
  tagCommitMessage = "[Release] - New version: "
  newVersionCommitMessage = "[Release] - Preparing next dev release: "
}

jib {
    container {
        jvmFlags = listOf("-Duser.language=sv-SE", "-Dfile.encoding=UTF-8 ", "-Duser.timezone=UTC")
        ports = listOf("8080")
    }
}

tasks.register("printVersion") {
  description = "Prints the current version"
  doLast {
    println("Current version: $version")
  }
}
