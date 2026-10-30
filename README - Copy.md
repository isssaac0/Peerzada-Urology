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


## Surgical Procedures (CMS workflow)

In `/admin` → **Surgical Procedures** → *New Surgical Procedure*:

1. Enter the **Procedure Title**, pick a **Category**, write the **Overall Description** (one for the whole procedure), and optionally a **Procedure Date**.
2. **Surgical Photographs** is a custom widget (`public/admin/surgical-steps-widget.js`):
   - **Add photographs** (or drag files onto the dashed box) — several at once. Each becomes a stage with an instant thumbnail.
   - Type a **title** for every stage.
   - **Reorder** by dragging the ⠿ *Drag* handle, or with the ◀ ▶ buttons (works on touch). The numbers on the cards are the order on the website. The list order is the only ordering — there is no separate order field.
   - **Adjust** (click a thumbnail): Instagram-style editor — drag to reposition, scroll / slider / pinch to zoom, choose a shape (Original, 1:1, 4:5, 3:4, 4:3, 3:2, 16:9), **Reset**. It is shown inside the same frame visitors see. *Original* never cuts anything off.
   - **Replace** swaps the photograph (keeps the title); **Delete** removes the stage.
   - **Preview sequence** shows the whole procedure exactly as visitors will see it.
3. Tick **Patient consent confirmed** only when written consent is on file. Untick **Draft** to publish. A procedure is shown only when *Draft is off* **and** *consent is ticked*.
4. **Show graphic-content warning** (on by default) puts a click-through notice in front of the photographs.

How adjustments are stored: the uploaded **original is never modified**. Each stage in `content/procedures/*.md` keeps `image`, `title` plus optional `width`, `height`, `ratio`, `zoom`, `focusX`, `focusY`. The website turns these into CSS at render time (`lib/framing.ts`; the CMS widget uses identical maths — keep the two in sync). Entries created before this widget (image + title only) keep working and show each photograph whole.

Notes:
- Photographs are committed to the repository (`public/uploads/procedures`). Removing or replacing a photograph in a procedure does **not** delete the uploaded file; delete it from the CMS *Media* tab (and note it stays in git history). Original files are publicly reachable by URL even for drafts, so upload only consented, de-identified photographs, ideally with EXIF/GPS metadata removed. The website serves re-encoded copies through the Next.js image optimiser, which drops EXIF.
- The widget relies on Decap's `window.h` / `window.createClass` and `onPersistMedia`, verified with Decap 3.17 (the admin page loads `decap-cms@^3.3.3` from unpkg).
- Procedures appear on the homepage immediately after *Training & Credentials*, on `/procedures`, and each has its own page at `/procedures/<slug>`.
- Research papers have **Authors** (list), **DOI**, **Publication URL** and **Draft** fields. Action buttons only appear for resources that exist.

## How images fit their placeholders

Placeholder sizes are fixed by the layout; uploaded images never change them, and every image fills its placeholder with no empty bars (`components/ui/FitImage.tsx`).

**You choose what stays visible.** Every image field shown in a placeholder (gallery, certificates, service images, patient journey, hero photo) uses the `framed_image` CMS widget: after uploading, drag the picture and zoom (scroll, slider or pinch) inside a frame of the exact shape it is shown in. Where one image appears in several shapes (e.g. gallery 4:3 and carousel 3:4), small "Also shown as…" previews update live, and the same crop is used in all of them. The original file is never modified.

The crop is stored inside the image value: `/uploads/x.jpg#f=2,43,42.6` (zoom, focus X %, focus Y %). Existing entries without a crop keep working and are simply centred until adjusted. The website applies it with CSS (`lib/imageFraming.ts`).

Procedure covers are a collage of all stage photographs; the procedure page shows each stage whole in a fixed 4:3 frame, with a full-screen view.
