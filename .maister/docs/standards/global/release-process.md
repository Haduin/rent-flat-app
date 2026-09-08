## Release Process

### Semantic Versioning for Releases
Project releases must follow Semantic Versioning (MAJOR.MINOR.PATCH), e.g. 1.0.0, 1.1.2, 2.0.0.
*Evidence: frontend/README.md (confidence 85)*

### Pre-Release Checklist
Before every release, always: bump the version in package.json, check the environment configuration, and verify environment variables.
*Evidence: frontend/README.md (confidence 84)*

### Docker-Based Release Pipeline
Both backend and frontend are released the same way: build the production artifact (gradle jar for backend / pnpm build for frontend), build a Docker image, tag it, log in to the Docker registry, and push the image (`haduin/mieszkania-backend`, `haduin/mieszkania-frontend` on Docker Hub).
*Evidence: backend/README.md, frontend/README.md (confidence 80)*
