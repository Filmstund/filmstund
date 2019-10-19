import org.ajoberstar.grgit.Grgit
import java.time.ZonedDateTime
import kotlin.math.abs

plugins {
  kotlin("jvm")
  id("org.jetbrains.kotlin.plugin.spring")
  id("org.jetbrains.kotlin.plugin.jpa")
  id("org.springframework.boot")
  id("io.spring.dependency-management")
  id("org.ajoberstar.grgit")
  id("com.gorylenko.gradle-git-properties")
  id("com.google.cloud.tools.jib")
}


dependencies {
  implementation(project(":api"))
  implementation(project(":database"))
  implementation(project(":mongo"))

  implementation("com.graphql-java-kickstart:graphql-spring-boot-starter:5.10.0")
  //  UI for GraphQL queries available at /graphiql
  //  compile("com.graphql-java-kickstart:graphiql-spring-boot-starter:5.10.0")
  implementation("org.springframework.boot:spring-boot-starter-web")
  implementation("org.springframework.boot:spring-boot-starter-logging")
  implementation("org.springframework.boot:spring-boot-starter-cache")
  implementation("org.springframework.boot:spring-boot-starter-security")
  implementation("org.springframework.boot:spring-boot-starter-mustache")
  implementation("org.springframework.boot:spring-boot-starter-actuator")
  implementation("org.springframework.security:spring-security-jwt:1.0.10.RELEASE")
  implementation("org.springframework.security.oauth:spring-security-oauth2:2.3.6.RELEASE")
  implementation("org.springframework.boot:spring-boot-devtools")

  // Database
  runtime("org.postgresql:postgresql:42.2.6")
  implementation("org.liquibase:liquibase-core:3.8.0")


  implementation("org.springframework.data:spring-data-commons")

  implementation("com.github.ben-manes.caffeine:caffeine:2.+")
  implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
  implementation("com.fasterxml.jackson.datatype:jackson-datatype-jsr310")
  implementation("com.google.guava:guava:28.1-jre")
  implementation("net.sf.biweekly:biweekly:0.6.3")

  /* The following are needed under java 11 */
  runtime("javax.xml.bind:jaxb-api:2.3.0")
  runtime("com.sun.xml.bind:jaxb-impl:2.3.0")
  runtime("com.sun.xml.bind:jaxb-core:2.3.0.1")
  runtime("javax.activation:activation:1.1.1")

  runtime("org.apache.commons:commons-lang3:3.9")
  implementation("org.apache.httpcomponents:httpclient:4.5.9")

  implementation(kotlin("stdlib-jdk8"))
  implementation(kotlin("stdlib"))
  implementation(kotlin("reflect"))

  testImplementation("org.springframework.boot:spring-boot-starter-test")
  testImplementation("org.springframework.security:spring-security-test")
  testImplementation("org.junit.jupiter:junit-jupiter-api")
  testRuntimeOnly("org.junit.jupiter:junit-jupiter-engine")
  testImplementation("org.mockito:mockito-core:3.1.0")
  testImplementation("org.mockito:mockito-junit-jupiter:3.1.0")
  testImplementation("com.opentable.components:otj-pg-embedded:0.13.1")
  testImplementation("org.jeasy:easy-random-core:4.0.0")
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
        "  ├───────────────┼───────────────────────────────────────────────────────┤\n" +
        "  │ Version       │ $projectVersion\n" +
        "  │ Revision SHA  │ $gitCommitId\n" +
        "  │ Revision Date │ $gitCommitTime\n" +
        "  │ Build date    │ $now\n" +
        "  └───────────────┴───────────────────────────────────────────────────────┘"
    val bannerFile = File("${project.rootDir}/app/build/banner.txt")
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

gitProperties {
  keys = listOf("git.branch", "git.commit.id", "git.commit.message.short", "git.commit.time", "git.tags")
}

springBoot {
  buildInfo()
}

jib {
  container {
    jvmFlags = listOf("-Duser.language=sv-SE", "-Dfile.encoding=UTF-8", "-Duser.timezone=UTC")
    ports = listOf("8080")
  }
}
