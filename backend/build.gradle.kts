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

// Separate source set for Testcontainers-backed integration tests, kept out of the default
// `test` task so `./gradlew test` stays fast and Docker-free. Run with `./gradlew integrationTest`.
sourceSets {
    val integrationTest by creating {
        kotlin.srcDir("src/integrationTest/kotlin")
        resources.srcDir("src/integrationTest/resources")
        compileClasspath += sourceSets.main.get().output
        runtimeClasspath += output + compileClasspath
    }
}

val integrationTestImplementation by configurations.getting {
    extendsFrom(configurations.testImplementation.get())
}
val integrationTestRuntimeOnly by configurations.getting {
    extendsFrom(configurations.testRuntimeOnly.get())
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
    implementation("org.flywaydb:flyway-core:10.20.1")
    implementation("org.flywaydb:flyway-database-postgresql:10.20.1")
    implementation("io.ktor:ktor-server-netty-jvm")
    implementation("ch.qos.logback:logback-classic:$logback_version")
    implementation("io.ktor:ktor-server-config-yaml-jvm")
    implementation("io.github.cdimascio:dotenv-kotlin:6.4.1")
    implementation("io.insert-koin:koin-ktor:$koin_ktor")
    implementation("io.insert-koin:koin-logger-slf4j:$koin_ktor")
    implementation("io.insert-koin:koin-ktor:$koin_ktor")
    testImplementation("io.ktor:ktor-server-test-host:${ktor_version}")
    testImplementation("org.jetbrains.kotlin:kotlin-test:${kotlin_version}")
    testImplementation("io.insert-koin:koin-test:$koin_ktor")
    testImplementation("io.ktor:ktor-server-test-host-jvm")
    testImplementation("io.mockk:mockk:1.13.8")
    testImplementation("io.ktor:ktor-server-test-host:${ktor_version}")
    testImplementation("org.jetbrains.kotlin:kotlin-test:${kotlin_version}")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit:$kotlin_version")

    implementation("io.ktor:ktor-server-core")
    implementation("io.ktor:ktor-server-netty")

    implementation("io.ktor:ktor-server-content-negotiation")
    implementation("io.ktor:ktor-serialization-kotlinx-json")

    implementation("io.ktor:ktor-server-openapi")
    implementation("io.ktor:ktor-server-swagger")
    implementation("io.github.smiley4:ktor-openapi:5.6.0")
    implementation("io.github.smiley4:schema-kenerator-core:2.7.1")
    implementation("io.github.smiley4:schema-kenerator-reflection:2.7.1")
    implementation("io.github.smiley4:schema-kenerator-serialization:2.7.1")
    implementation("io.github.smiley4:schema-kenerator-jsonschema:2.7.1")
    implementation("io.github.smiley4:schema-kenerator-swagger:2.7.1")
    implementation("io.github.smiley4:schema-kenerator-jackson:2.7.1")
    implementation("io.github.smiley4:schema-kenerator-jackson-jsonschema:2.7.1")
    implementation("io.github.smiley4:schema-kenerator-jackson-swagger:2.7.1")
    implementation("io.github.smiley4:schema-kenerator-validation-swagger:2.7.1")

    implementation("org.jetbrains.exposed:exposed-core")

    integrationTestImplementation("org.testcontainers:postgresql:1.21.3")
    integrationTestImplementation("org.testcontainers:junit-jupiter:1.21.3")
    integrationTestImplementation("org.junit.jupiter:junit-jupiter-api:5.10.2")
    integrationTestRuntimeOnly("org.junit.jupiter:junit-jupiter-engine:5.10.2")
}

val integrationTest = tasks.register<Test>("integrationTest") {
    description = "Runs integration tests against a real PostgreSQL instance via Testcontainers. Requires a running Docker daemon."
    group = "verification"
    testClassesDirs = sourceSets["integrationTest"].output.classesDirs
    classpath = sourceSets["integrationTest"].runtimeClasspath
    useJUnitPlatform()
    shouldRunAfter(tasks.test)
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
