import org.ajoberstar.grgit.Grgit
import java.time.ZonedDateTime
import kotlin.math.abs

plugins {
  id("org.springframework.boot")
  id("org.ajoberstar.grgit")
  id("com.gorylenko.gradle-git-properties")
  id("com.google.cloud.tools.jib")
}


dependencies {
  api(platform(rootProject))

  implementation(project(":api"))
  implementation(project(":database"))
  implementation(project(":mongo"))

  implementation("com.graphql-java-kickstart:graphql-spring-boot-starter")
  //  UI for GraphQL queries available at /graphiql
  //  compile("com.graphql-java-kickstart:graphiql-spring-boot-starter:5.10.0")
  implementation("org.springframework.boot:spring-boot-starter-web")
  implementation("org.springframework.boot:spring-boot-starter-logging")
  implementation("org.springframework.boot:spring-boot-starter-cache")
  implementation("org.springframework.boot:spring-boot-starter-security")
  implementation("org.springframework.boot:spring-boot-starter-mustache")
  implementation("org.springframework.boot:spring-boot-starter-actuator")
  implementation("org.springframework.security:spring-security-jwt")
  implementation("org.springframework.security.oauth:spring-security-oauth2")
  implementation("org.springframework.boot:spring-boot-devtools")

  // Database
  runtimeOnly("org.postgresql:postgresql")
  implementation("org.liquibase:liquibase-core")


  implementation("org.springframework.data:spring-data-commons")

  implementation("com.github.ben-manes.caffeine:caffeine")
  implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
  implementation("com.fasterxml.jackson.datatype:jackson-datatype-jsr310")
  implementation("com.google.guava:guava")
  implementation("net.sf.biweekly:biweekly")

  /* The following are needed under java 11 */
  runtimeOnly("javax.xml.bind:jaxb-api")
  runtimeOnly("com.sun.xml.bind:jaxb-impl")
  runtimeOnly("com.sun.xml.bind:jaxb-core")
  runtimeOnly("javax.activation:activation")

  runtimeOnly("org.apache.commons:commons-lang3")
  implementation("org.apache.httpcomponents:httpclient")

  implementation(kotlin("stdlib-jdk8"))
  implementation(kotlin("stdlib"))
  implementation(kotlin("reflect"))

  testImplementation("org.springframework.boot:spring-boot-starter-test")
  testImplementation("org.springframework.security:spring-security-test")
  testImplementation("org.junit.jupiter:junit-jupiter-api")
  testRuntimeOnly("org.junit.jupiter:junit-jupiter-engine")
  testImplementation("org.mockito:mockito-core")
  testImplementation("org.mockito:mockito-junit-jupiter")
  testImplementation("com.opentable.components:otj-pg-embedded")
  testImplementation("org.jeasy:easy-random-core")
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
