## Tooling

### pnpm as the Frontend Package Manager
Frontend dependencies are managed and locked with pnpm rather than npm or yarn; even the Docker build stage installs pnpm globally and runs a frozen-lockfile install.
*Evidence: frontend/pnpm-lock.yaml present (no package-lock.json/yarn.lock), frontend/Dockerfile installs pnpm (confidence 75)*
