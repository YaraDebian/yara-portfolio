# yara's notebook

Personal site: journey, talks, clay & pastel, and notes & essays. Built with [Astro](https://astro.build); articles are written in Notion.

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # syncs Notion (if configured), then builds to dist/
```

## Editing the site

| What | Where |
| --- | --- |
| Bio, links, email, city, "currently…" note | `src/data/site.ts` |
| Journey chapters, talks (+ slides/video links) | `src/data/site.ts` |
| Clay & pastel photos | put images in `public/made/`, set `src` in `made` in `src/data/site.ts` |
| Local (non-Notion) articles | `src/content/blog/*.md` |

Anything in `[BRACKETS]` is a placeholder waiting for real content.

## Writing an article in Notion

Articles live in the **Portfolio — Articles** database (Notion → Blog).

1. Add a page, write it like any Notion page.
2. Fill in **Date**, **Description**, **Tags** (philosophy / rails / ai engineering / art) and optionally **Cover**, **Slug**, **Margin notes** (one sticky note per line).
3. Set **Status** to **Published**. Within the hour it's live (or trigger a deploy by hand to publish right away).

How Notion formatting shows up:

- Headings → handwritten headings
- Quote → peach sticky note (a second paragraph in the quote becomes the small "answer" line)
- Callout → yellow sticky note
- Code block → taped sheet of paper, syntax highlighted (set the language in Notion)
- Text background color → highlighter (yellow, purple, pink/red/orange → peach, blue, green)
- Images → downloaded at build time (Notion's own image links expire after an hour)

To unpublish, set Status back to Draft.

## One-time setup

### 1. Notion integration
1. Create an internal integration at https://www.notion.so/profile/integrations and copy its secret.
2. Open the **Portfolio — Articles** database → `•••` → **Connections** → add the integration.
3. Copy the database ID (the 32 characters in its URL before `?v=`).
4. Locally: `cp .env.example .env` and fill in `NOTION_TOKEN` and `NOTION_DATABASE_ID`.

### 2. Hosting on Render
1. In Render: **New → Blueprint**, pick this repo. `render.yaml` sets up a free static site (build `npm ci && npm run build`, publish `dist`).
2. When asked, fill in `NOTION_TOKEN` (the Notion secret) and `SITE_URL` (your domain, or the `onrender.com` URL for now).
3. Every push to `main` redeploys automatically.
4. In the service's **Settings → Deploy Hook**, copy the hook URL for the next step.

### 3. Auto-publish
In GitHub → Settings → Secrets and variables → Actions add `NOTION_TOKEN`, `NOTION_DATABASE_ID` and `DEPLOY_HOOK` (the Render deploy hook URL).

`.github/workflows/publish.yml` then checks Notion every hour and redeploys only if an article changed. To publish instantly, open **Actions → Publish from Notion → Run workflow** (works from the GitHub mobile app too), or hit **Manual Deploy** in Render.

On a paid Notion plan you can also add a database button with the action **Send webhook** pointing at the deploy hook URL, for one-click publishing from inside Notion.

If the Notion sync fails during a build, the build fails on purpose so the previous version stays live.
