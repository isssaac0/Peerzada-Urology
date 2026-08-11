# Dr. Peerzada Faisal Masood — Website

A production-ready doctor website built with Next.js (App Router), React,
TypeScript, Tailwind CSS, and Decap CMS. All content — the doctor's
profile, qualifications, awards, services, patient journey, clinic
timings, gallery, videos, and blog posts — is stored as Markdown/YAML
files in `/content` and is fully editable through a CMS dashboard at
`/admin`, with no code changes required.

---

## Project structure

```
/app            → pages and routes (Next.js App Router)
  /api/auth     → OAuth route (step 1 of the CMS login handshake)
  /api/callback → OAuth route (step 2 — hands the login back to Decap)
/components
  /ui           → generic, content-agnostic pieces (Button, Section, FaqAccordion, etc.)
  /sections     → page sections (Hero, ServicesGrid, Footer, etc.) — all driven by typed content, nothing hardcoded
/content        → Markdown/YAML content files — this is what Decap CMS edits
/lib/content.ts → typed functions that read /content and hand typed data to pages
/types          → shared TypeScript interfaces, one per content type
/public/admin   → Decap CMS itself (index.html + config.yml)
/public/uploads → where the CMS saves uploaded images
```

Every collection in `public/admin/config.yml` maps to a folder (or file)
in `/content`, and to a loader function in `lib/content.ts`. If you ever
add a new content type, that's the pattern: add a folder in `/content`,
a type in `/types/content.ts`, a loader in `/lib/content.ts`, and a
collection in `config.yml`.

---

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000. The CMS admin panel (`/admin`) won't fully
log in locally without the OAuth setup below — unless you use local CMS
testing (next section), which is the easiest way to try it out before
deploying anywhere.

---

## Testing the CMS locally (before deploying)

`local_backend: true` is already set in `public/admin/config.yml`, which
lets you use the CMS on your own computer with no GitHub/Vercel setup at
all. It writes directly into this project's `/content` and
`/public/uploads` folders on your machine.

1. In one terminal: `npm run cms` (starts a small local server the CMS
   talks to instead of GitHub).
2. In a second terminal: `npm run dev` (starts the site itself).
3. Open `http://localhost:3000/admin` — it should go straight into the
   CMS dashboard, no login screen.
4. Any edit you publish there is saved straight into this project's
   files, and shows up on the site immediately.

This is only for trying things out on your machine — it doesn't affect
the doctor's real, deployed CMS login, which still goes through the
GitHub OAuth setup below once the site is live.

---

## Deploying the site (no CMS login yet)

You can deploy and view the live site before setting up the CMS at all:

1. Push this project to a new GitHub repository (see steps below).
2. Go to [vercel.com](https://vercel.com), create a new project, and
   import that repository.
3. Use the default settings — Vercel auto-detects Next.js. Click Deploy.

That's it — your site is live. The steps below are only needed to let
the doctor actually log in and edit content through `/admin`.

### Pushing to GitHub for the first time

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

(Create the empty repository on GitHub first, without a README —
otherwise the push above will conflict.)

---

## Setting up Decap CMS (so the doctor can log in and edit content)

Decap's GitHub backend needs an OAuth app to handle logins. This project
already includes the two API routes that do that (`/api/auth` and
`/api/callback`) — you just need to register a GitHub OAuth App and
give it the resulting credentials.

1. **Deploy the site to Vercel first** (see above) and note your live
   URL, e.g. `https://dr-peerzada-urology.vercel.app`.

2. **Create a GitHub OAuth App:**
   - Go to GitHub → Settings → Developer settings → OAuth Apps → New OAuth App
   - **Homepage URL:** your Vercel URL (e.g. `https://dr-peerzada-urology.vercel.app`)
   - **Authorization callback URL:** your Vercel URL + `/api/callback`
     (e.g. `https://dr-peerzada-urology.vercel.app/api/callback`)
   - Click Register application, then generate a new **Client Secret**.
   - Copy the **Client ID** and **Client Secret** — you'll need both next.

3. **Add environment variables in Vercel:**
   - In your Vercel project → Settings → Environment Variables, add:
     - `OAUTH_CLIENT_ID` = the Client ID from step 2
     - `OAUTH_CLIENT_SECRET` = the Client Secret from step 2
   - Redeploy the project so the new variables take effect (Vercel →
     Deployments → click the three dots on the latest deployment →
     Redeploy).

4. **Update `public/admin/config.yml`:**
   - Set `repo:` to your actual GitHub repo, in `owner/repo-name` form.
   - Set `base_url:` to your actual Vercel URL.
   - Commit and push this change (or edit it directly on GitHub) —
     Vercel will redeploy automatically.

5. **Log in:**
   - Visit `https://YOUR-SITE.vercel.app/admin`
   - Click "Login with GitHub"
   - Authorize the app when prompted
   - You should land in the CMS dashboard, with all 9 collections
     ready to edit.

Only GitHub accounts with write access to the repository will be able
to log in and publish changes — this is controlled by GitHub's own
repository permissions, not by anything in this codebase. To give the
doctor edit access without giving him access to the code itself, add
him as a collaborator on the GitHub repo (Settings → Collaborators).

---

## Custom domain (optional)

In Vercel: Project → Settings → Domains → add your domain and follow
the DNS instructions shown there. If you do this, update `base_url` in
`config.yml` and the GitHub OAuth App's URLs to match the new domain.

---

## What's already filled in vs. what the doctor adds later

**Already filled in:** Doctor Profile, Qualifications, Awards &
Achievements, all 6 Services (with full detail pages), and all 4
Patient Journey phases (including the interactive Recovery Meter,
Urine Color Matcher, and Symptom Checker).

**Left empty, for the doctor to add via `/admin`:** Clinic Timings,
Gallery photos, Videos, and Blog Posts.
