# Legacy UI — deprecated

The views in `src/pages/**` (and their `/protected/*` routes) are the old UI. They are **no longer routed**:
`src/router/router.tsx` redirects every legacy `/protected/*` URL to `/protected/v2/dashboard`.

The new UI lives in `frontend/new_ui/` (routes `/protected/v2/*`).

- Do not add features or fixes to the legacy views; do not import them from `new_ui/`.
- Some non-view modules here (API hooks in `*/api/`, dialogs, form fields in `src/components/`) are still used by `new_ui` and are **not** deprecated until `new_ui` has its own replacements.
- The legacy files stay in the repo until a separate cleanup removes them.
