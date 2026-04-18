# CLAYTON Workflow

## Today

1. Install Expo Go on your phone.
2. From this folder, run `npm run phone`.
3. Scan the QR code with your phone.
4. Open the CLAYTON app and play the bundled Stratford Ave demos.

## Backend Connection

Supabase is connected.

- Organization: `CLAYTON`
- Project: `clayton-app`
- Project ref: `osespyexerpyooqleoxz`
- API URL: `https://osespyexerpyooqleoxz.supabase.co`

The first remote migration has been pushed. It creates project, track, and asset tables plus private Storage buckets for audio, artwork, and general assets.

Use these commands for future schema updates:

```sh
supabase db push
```

Local Expo environment values live in `.env.local`, which is intentionally ignored by Git.

## Repo Connection

Git is available and configured as Clayton Brown. `gh` is not installed, so GitHub work should use either the connected GitHub app or a later GitHub CLI install.

Recommended repo name: `clayton-app`.

## Product Spine

- Projects: album, EP, single, visual world, live set, rollout.
- Tracks: demos, boardtapes, rough mixes, masters.
- Assets: cover images, moodboards, lyrics, notes, references.
- Sync: Supabase database plus Supabase Storage for audio and images.
