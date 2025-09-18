# The Narrative Lens — Starter Pack (Postmark only, no Mailchimp)

Static site + hourly feeds ingest that writes `data/feeds.json` + GitHub Pages deploy.

## What’s inside
- Multi-page IA: Home, Narratives, Narrative News (feeds), Timeline, Lens Test, Videos, Help, About, Privacy, Terms, Unsubscribe, **Subscribe (demo-only)**.
- Design tokens & components in `css/styles.css`.
- Client JS (`js/app.js`) to render Narrative News from `/data/feeds.json`.
- Workflows:
  - `pages.yml` — deploy static site on push to `main`.
  - `feeds.yml` — hourly ingest → `data/feeds.json` commit on `main`.
- Scripts: `scripts/ingest_feeds.py` (feedparser + optional og:image scrape).
- Data: sample JSON files and `data/sources.yml` list of feeds.

## Quick start
1. Create a new GitHub repo (e.g., `thenarrativelens-site`) and upload these files (drag the **folder contents** so `.github/` is preserved).
2. Settings → Pages → Build & deployment = **GitHub Actions**.
3. Visit **Actions** → confirm the **Deploy Pages** run completed. Your site will be live at `https://<you>.github.io/<repo>/`.
4. Run **Feeds (hourly)** workflow manually once (Actions → Feeds → Run workflow) to generate the first `/data/feeds.json`. The hourly schedule will keep it fresh.

## Subscribe page
- No Mailchimp. `/subscribe.html` is **demo-only** — it does not submit anywhere.
- Postmark SMTP integration is planned inside a newsletter workflow (not included here).

## Optional secrets (for future newsletter send via Postmark)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `FROM_ADDR`, `TO_ADDRS`

## Permissions
If the **feeds** workflow fails to push, enable **Actions → General → Workflow permissions → Read and write**.

## License
MIT
