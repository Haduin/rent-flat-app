## Development Conventions

### Predictable Structure
Organize files and directories in a logical, navigable layout.

### Up-to-Date Documentation
Keep README files current with setup steps, architecture overview, and contribution guidelines.

### Clean Version Control
Write clear commit messages, use feature branches, and add meaningful descriptions to pull requests.

### Environment Variables
Store configuration in environment variables; never commit secrets or API keys.

### Minimal Dependencies
Keep dependencies lean and up-to-date; document why major ones are included.

### Consistent Reviews
Follow a defined code review process with clear expectations for reviewers and authors.

### Testing Standards
Define required test coverage (unit, integration, etc.) before merging.

### Feature Flags
Use flags for incomplete features instead of long-lived branches.

### Changelog Updates
Maintain a changelog or release notes for significant changes.

### Build What's Needed
Avoid speculative code and "just in case" additions (see minimal-implementation.md).

### Ground Work in Project Documentation Before Coding
Before writing or changing any code — even for quick, direct requests that don't go through a /maister:* workflow — read `.maister/docs/INDEX.md` first, then open and read the specific standards/project docs it points to that are relevant to the task. The index alone is not enough. Follow the standards while working; if a standard conflicts with the task, ask the user rather than silently deviating.
*Evidence: CLAUDE.md (confidence 88)*

### Propose Standards Updates for Recurring Patterns
When recurring patterns, fixes, or conventions are noticed during implementation that aren't yet captured in the standards docs, briefly suggest the standard to the user; if approved, invoke `/maister:standards-update` to record it.
*Evidence: CLAUDE.md (confidence 82)*
