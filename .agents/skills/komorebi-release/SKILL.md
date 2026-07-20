---
name: komorebi-release
description: Release the Komorebi browser extension. Use when cutting a new version, publishing to the Chrome Web Store, checking release workflows, or writing concise GitHub Release notes for a Komorebi release.
---

# Komorebi Release

## Overview

Use this skill to ship Komorebi without re-deriving the release flow. Keep the
release process boring and the notes short.

## Cadence

There is no fixed calendar. Cut a patch release when there is a user-visible fix
worth shipping, or after a small batch of low-risk polish changes.

## Workflow

1. Check `git status --short --branch` and confirm the release only includes the
   intended changes.
2. Bump `version` in `package.json` and `manifest.json`.
3. Run the smallest release checks that catch packaging breakage:
   `bun run typecheck`, `bun run build`, and `bun run zip`.
4. Commit as `chore: release x.y.z`.
5. Tag and push:

   ```sh
   git tag vx.y.z
   git push origin main vx.y.z
   ```

6. Confirm the GitHub Actions release and Chrome Web Store publish workflows
   finish successfully.

For one-time publishing setup details, use `PUBLISHING.md`.

## GitHub Release Notes

After the GitHub Release is created, keep the release log concise:

- Lead with the main user-visible fix or change.
- Mention notable theme/UI behavior only if users can see it.
- Mention verification only when it matters, for example that the affected page
  was checked.
- Avoid implementation details unless they explain the user-visible behavior.

Good shape:

```md
Fixed Google Images thumbnails disappearing when Komorebi themed search pages.

Verified against Google Images after reloading the packaged extension.
```
