allprojects {
  repositories {
    mavenCentral()
    gradlePluginPortal()
  }
}

subprojects {
  tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile> {
    kotlinOptions {
      jvmTarget = "1.8"
      freeCompilerArgs = listOf("-Xjsr305=strict")
    }
  }

  tasks.withType<Test> {
    useJUnitPlatform()
  }

  apply(plugin = "org.jetbrains.kotlin.jvm")
  apply(plugin = "org.jetbrains.kotlin.plugin.spring")
}


plugins {
  `java-platform`
  kotlin("jvm") apply false
  id("org.jetbrains.kotlin.plugin.spring") apply false
  id("com.github.ben-manes.versions")
}

dependencies {
  val springBootVersion: String by project

  api(platform("org.jdbi:jdbi3-bom:3.11.1"))
  api(platform("org.springframework.boot:spring-boot-dependencies:$springBootVersion"))
  constraints {
    api("com.graphql-java-kickstart:graphql-spring-boot-starter:6.0.0")
    api("com.googlecode.libphonenumber:libphonenumber:8.11.0")
    api("com.google.guava:guava:28.1-jre")
    api("org.mockito:mockito-core:3.2.0")
    api("org.mockito:mockito-junit-jupiter:3.2.0")
    api("com.opentable.components:otj-pg-embedded:0.13.3")
    api("org.jeasy:easy-random-core:4.1.0")
    api("net.sf.biweekly:biweekly:0.6.3")
    api("org.apache.commons:commons-lang3:3.9")
    api("com.github.ben-manes.caffeine:caffeine:2.+")
    api("org.springframework.security:spring-security-jwt:1.1.0.RELEASE")
    api("org.springframework.security.oauth:spring-security-oauth2:2.4.0.RELEASE")

    /* DB */
    api("org.postgresql:postgresql:42.2.9")
    api("org.liquibase:liquibase-core:3.8.2")

    /* The following are needed under java 11 */
    runtime("javax.xml.bind:jaxb-api:2.3.0")
    runtime("com.sun.xml.bind:jaxb-impl:2.3.0")
    runtime("com.sun.xml.bind:jaxb-core:2.3.0.1")
    runtime("javax.activation:activation:1.1.1")
  }
}

javaPlatform {
  allowDependencies()
}
