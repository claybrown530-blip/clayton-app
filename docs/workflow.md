# CLAYTON Workflow

## Today

1. Install Expo Go on your phone.
2. From this folder, run `npm run phone`.
3. Scan the QR code with your phone.
4. Open the CLAYTON app and play the bundled Stratford Ave demos.

## Backend Connection

Supabase CLI is installed on this Mac, but it is not logged in yet. Run:

```sh
supabase login
supabase projects list
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

Then copy `.env.example` to `.env` and add your project URL and anon key.

## Repo Connection

Git is available and configured as Clayton Brown. `gh` is not installed, so GitHub work should use either the connected GitHub app or a later GitHub CLI install.

Recommended repo name: `clayton-app`.

## Product Spine

- Projects: album, EP, single, visual world, live set, rollout.
- Tracks: demos, boardtapes, rough mixes, masters.
- Assets: cover images, moodboards, lyrics, notes, references.
- Sync: Supabase database plus Supabase Storage for audio and images.
