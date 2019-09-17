import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

allprojects {
  repositories {
    mavenCentral()
    gradlePluginPortal()
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
}

subprojects {
  apply(plugin = "io.spring.dependency-management")

  dependencyManagement {
    imports {
      mavenBom("org.springframework.boot:spring-boot-dependencies:2.1.8.RELEASE") {
        bomProperty("kotlin.version", "1.3.50")
      }
    }
  }
}


plugins {
  base
  kotlin("jvm") apply false
  id("com.github.ben-manes.versions")
  id("org.springframework.boot") apply false
  id("io.spring.dependency-management")
}

dependencies {
  subprojects.forEach {
    archives(it)
  }
}

tasks.register("printVersion") {
  description = "Prints the current version"
  doLast {
    println("Current version: $version")
  }
}

