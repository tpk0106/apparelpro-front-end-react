# Workflow Conventions

## Always show code before applying

For every backend and frontend change in this project (ApparelPro Clipper migration), Claude must:

1. Show the full proposed code/diff to the user first.
2. Wait for explicit approval (e.g. "yes", "ok", "go ahead") before writing/committing any change to the user's actual files (via device_stage_files / SendUserFile / device_commit_files or any other means).
3. Never batch multiple unapproved changes together and apply them all at once — each proposed change needs its own explicit go-ahead, unless the user has already approved a specific multi-file plan in the same turn.

This applies regardless of how confident Claude is that the fix is correct, and regardless of whether earlier related changes were already approved.

## Existing conventions (carried over from project instructions)

- Backend development first, then frontend, as separate steps, for every functionality.
- No native browser `alert()`/`confirm()`/`window.confirm()` — use `react-toastify` toasts for notifications and the shared `ConfirmDialog` component (`src/components/common/confirm-dialog.tsx`) for confirmation prompts.
- Zero-assumption boundary rule: never guess undocumented legacy Clipper behavior or schema — check project docs, actual source, or ask.

## use Software engineering principles and best tips and tricks

- use best practices whnever possible with front end react technolgy.
- use SOLID princiles and Design patterns where possible. reason out why and where it could be used.
- Use industry latest standards in both front end and backend.
