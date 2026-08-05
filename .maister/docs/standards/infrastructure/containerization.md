## Containerization

### Multi-stage Docker Builds
Both backend and frontend Dockerfiles use multi-stage builds: compile/build in a heavier SDK/toolchain image, then copy only the produced artifact into a slim runtime image (`amazoncorretto:21` for the backend JAR, `nginx:latest` serving the frontend's static `dist` output).
*Evidence: backend/Dockerfile, frontend/Dockerfile (confidence 75)*

### Docker Compose for Local Dependency Services
Local development dependencies (app PostgreSQL, plus a separate PostgreSQL and Keycloak for auth) are provisioned via docker-compose rather than installed locally, sharing a single `keycloak_network` bridge network.
*Evidence: db/docker-compose.yaml (confidence 75)*
