package pl.chodan.config

import org.testcontainers.containers.PostgreSQLContainer

class TestPostgresContainer : PostgreSQLContainer<TestPostgresContainer>("postgres:15-alpine")
