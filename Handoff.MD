SmartPetBuys — Project Handoff

As of: 2025-08-11 12:00 (local)Owner: YouGoal: Launch and operate a fully automated affiliate blog for pet products with zero-cost hosting and scheduled AI‑generated content.

1) Project Snapshot

Niche: Pets & Pet Care (product‑focused reviews, guides, comparisons)

Brand/Domain: SmartPetBuys — smartpetbuys.com (Cloudflare Registrar)

Hosting/CDN: Cloudflare Pages (static hosting)

Static Site Generator: Hugo v0.148.2 (extended)

Theme: PaperMod

Repo: GitHub — smartpetbuys (connected to Cloudflare Pages)

Current Base URL: https://smartpetbuys.pages.dev/When custom domain is mapped, switch baseURL to https://smartpetbuys.com/ in hugo.toml.

Branding: Logo, social avatar, banner, website style guide completed (Primary #FF7F32, Secondary #1A2A42, Accent #FFFFFF; Headings: Montserrat Bold; Body: Open Sans Regular)

Monetization: Affiliate shortcode implemented; starter data/products.json with example products

Content: Sample posts live; structure ready for automation

Automation: GitHub Action + AI generator prepared (set OPENAI_API_KEY in repo secrets)

2) Full Scope / Definition of Done

Branding & Identity — ✅ Complete (logo, colors, typography, social assets)

Site Framework — ✅ Complete (Hugo + PaperMod on Cloudflare Pages)

Monetization Layer — ✅ In place (product shortcode + data/products.json)

Automation Pipeline — 🔶 To finalize (schedule active, API key set, first automated run verified)

Traffic & Growth — 🔜 Next (SEO plumbing, internal linking, email list, social auto‑posting)

Compliance — 🔜 Next (Privacy Policy, Terms, Cookie notice, Affiliate disclosure)

Scaling — 🔜 Future (price/API sync, image automation, multiple niches/sites)

3) Tech Stack & Tools

Languages & FormatsMarkdown (posts), TOML (Hugo config), HTML (shortcodes), JSON (product data), YAML (GitHub Actions), Python (generator), PowerShell (setup scripts).

ServicesCloudflare Pages (hosting/build), GitHub (repo + Actions), OpenAI API (content generation), Affiliate networks (Amazon Associates, others). Optional later: Unsplash/Pexels APIs for images.

VersionsHugo: 0.148.2; Theme: PaperMod (latest at time of setup).

4) Repository Structure (key paths)

/
├─ content/
│  └─ posts/
│     ├─ hello-world.md
│     └─ best-dog-puzzle-toys/
│        └─ index.md
├─ data/
│  └─ products.json
├─ layouts/
│  └─ shortcodes/
│     └─ product.html
├─ scripts/
│  └─ generate_post.py            # AI generator → Markdown
├─ .github/
│  └─ workflows/
│     └─ auto-post.yml            # Scheduled publisher
├─ static/                        # images, favicon, etc.
└─ hugo.toml                      # site configuration

5) Current hugo.toml essentials

baseURL = "https://smartpetbuys.pages.dev/"
languageCode = "en-us"
title = "SmartPetBuys"
theme = "PaperMod"

[pagination]
  pagerSize = 10

[params]
  defaultTheme = "auto"
  description  = "Smart choices for your pets — reviews, guides, and deals."
  mainSections = ["posts"]

[params.homeInfoParams]
  Title = "Smart choices for your pets"
  Content = "Independent reviews, buying guides, and deals — updated automatically."

After mapping the custom domain, change baseURL to https://smartpetbuys.com/ and push.

6) Monetization Components

Shortcode: layouts/shortcodes/product.html

Usage inside posts: {{< product id="toy-01" >}}

Outputs a styled box with image, blurb, and rel="nofollow sponsored" CTA button.

Product Data: data/products.json

Map of product IDs → affiliate URL/image/name/blurb.

Extend with per‑category JSON files (e.g., data/dogs.json) if desired; update shortcode to pull from multiple files.

7) Automation Pipeline (prepared)

Generator: scripts/generate_post.py

Reads keywords.csv → calls OpenAI → writes content/posts/<slug>/index.md with front matter (draft: false).

Scheduler: .github/workflows/auto-post.yml

Runs on cron (weekdays 14:00 UTC by default) or manual dispatch.

Commits new posts → Cloudflare Pages auto-builds and deploys.

Secrets (GitHub → Settings → Secrets → Actions):

OPENAI_API_KEY – OpenAI key for generator.

Daily flow:

Action triggers → 2) Python generates posts from keywords.csv rows with publish=yes → 3) Commit & push → 4) Pages builds → 5) Live.

8) Branding Summary

Primary: #FF7F32 (CTAs, highlights)

Secondary: #1A2A42 (headers, nav, footer)

Accent/Background: #FFFFFF

Typography: Headings — Montserrat Bold; Body — Open Sans Regular

Social assets (avatar/banner) and website style guide are complete.

9) Operations — Quick Commands

Local previewhugo server -D → visit the local URL printed.

Deploy (via Git push)

hugo                 # optional local build
git add .
git commit -m "Update content/config"
git push             # Cloudflare Pages auto-builds

Manual post

hugo new posts/my-article.md
# edit file, then set: draft: false

Add/Update productEdit data/products.json (keep valid JSON); use the product ID in posts via shortcode.

10) Future Plans / Backlog

A) Automation & Content

Finalize GitHub Action schedule & verify first automated run.

Add image automation (Unsplash/Pexels by keyword; save under static/img/... and reference in front matter).

Add category‑specific prompts (dogs, cats, grooming, toys) for tighter relevance.

Content refresh workflow (periodically update intros/FAQs on aging posts).

B) SEO & Analytics

Connect Google Search Console (domain property) and submit sitemap.

Add GA4 ID in hugo.toml.

Confirm sitemap.xml and add robots.txt.

Enable related posts/internal linking (Hugo related content or PaperMod options).

C) Monetization Enhancements

Expand products.json; create comparison-table shortcode.

Optional link cloaking via /go/<slug>/ and Cloudflare rules.

Nightly price/availability sync via affiliate APIs (update data/).

D) UX & Content Model

Menus by category (Dogs, Cats, Grooming, Training, Deals).

Create About, Contact, Affiliate Disclosure, Privacy, Terms pages.

Improve list pages (category landing templates).

E) Traffic & Growth

Social auto-post via Buffer API from a GitHub Action.

Email list (Beehiiv/ConvertKit) + weekly digest of new posts.

Lead magnet (PDF checklist/buying guide) for capture.

F) Performance & Quality

Lighthouse audits; image compression pipeline.

Uptime & broken link monitoring.

A/B tests for CTA copy/color (config‑switchable).

11) Risks & Notes

Affiliate TOS (esp. Amazon) — follow linking & disclosure requirements.

OpenAI cost control — tune schedule, temperature, and max_tokens; review outputs.

Image licensing — only licensed/royalty‑free sources; cache locally.

Syntax pitfalls — JSON/TOML mistakes will break builds; validate before commit.

Base URL — remember to switch to https://smartpetbuys.com/ after mapping the domain.

12) Next‑Session Checklist

Map custom domain in Cloudflare Pages; update baseURL accordingly.

Add OPENAI_API_KEY and manually run Auto Publish workflow to validate.

Approve AI post template + category prompts.

Wire image automation and a comparison table shortcode.

Publish legal pages & affiliate disclosure banner.

Connect GSC + GA4; verify sitemap/robots.

Fill keywords.csv with your first 30 keywords and set publish=yes cadence.

13) Quick Reference — Files to Know

Config: /hugo.toml

Posts: /content/posts/.../index.md

Products: /data/products.json

Shortcode: /layouts/shortcodes/product.html

Generator: /scripts/generate_post.py

Scheduler: /.github/workflows/auto-post.yml

