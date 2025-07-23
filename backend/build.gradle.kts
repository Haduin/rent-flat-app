val exposed_version: String by project
val kotlin_version: String by project
val logback_version: String by project
val ktor_version: String by project
val koin_ktor: String by project

plugins {
    kotlin("jvm") version "2.1.0"
    id("io.ktor.plugin") version "3.0.1"
    id("org.jetbrains.kotlin.plugin.serialization") version "2.1.0"
}

group = "pl.chodan"
version = "0.0.1"

application {
    mainClass.set("io.ktor.server.netty.EngineMain")
    val isDevelopment: Boolean = project.ext.has("development")
    applicationDefaultJvmArgs = listOf("-Dio.ktor.development=$isDevelopment")
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("io.ktor:ktor-client-core:2.3.0")
    implementation("io.ktor:ktor-client-cio:2.3.0")
    implementation("io.ktor:ktor-server-core-jvm")
    implementation("io.ktor:ktor-server-content-negotiation-jvm")
    implementation("io.ktor:ktor-serialization-kotlinx-json-jvm")
    implementation("org.jetbrains.exposed:exposed-core:$exposed_version")
    implementation("org.jetbrains.exposed:exposed-jdbc:$exposed_version")
    implementation("org.jetbrains.exposed:exposed-java-time:$exposed_version")
    implementation("io.ktor:ktor-server-call-logging:$ktor_version")
    implementation("io.ktor:ktor-server-html-builder:$ktor_version")

    implementation("io.ktor:ktor-server-auth:$ktor_version")
    implementation("io.ktor:ktor-server-auth-jwt:$ktor_version")

    implementation("io.ktor:ktor-server-html-builder:$ktor_version")
    implementation("io.ktor:ktor-server-cors:$ktor_version")
    implementation("org.postgresql:postgresql:42.7.2")
    implementation("io.ktor:ktor-server-netty-jvm")
    implementation("ch.qos.logback:logback-classic:$logback_version")
    implementation("io.ktor:ktor-server-config-yaml-jvm")
    implementation("io.github.cdimascio:dotenv-kotlin:6.4.1")

    implementation("io.insert-koin:koin-ktor:$koin_ktor")
    implementation("io.insert-koin:koin-logger-slf4j:$koin_ktor")
    implementation("io.insert-koin:koin-ktor:$koin_ktor")
    testImplementation("io.ktor:ktor-server-test-host:${ktor_version}")
    testImplementation("org.jetbrains.kotlin:kotlin-test:${kotlin_version}")
    testImplementation("org.testcontainers:junit-jupiter:1.21.3")
    testImplementation("org.testcontainers:postgresql:1.21.3")
    testImplementation("io.insert-koin:koin-test:$koin_ktor")
    testImplementation("io.ktor:ktor-server-test-host-jvm")
    testImplementation("io.mockk:mockk:1.13.8")
    testImplementation("io.ktor:ktor-server-test-host:${ktor_version}")
    testImplementation("org.jetbrains.kotlin:kotlin-test:${kotlin_version}")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit:$kotlin_version")
}

tasks.jar {
    manifest {
        attributes["Main-Class"] = "io.ktor.server.netty.EngineMain"
    }

    duplicatesStrategy = DuplicatesStrategy.EXCLUDE

    from(configurations.runtimeClasspath.get().map {
        if (it.isDirectory) it
        else zipTree(it)
    })
}

tasks.withType<Jar> {
    archiveFileName.set("backend.jar")
}
