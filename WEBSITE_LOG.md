# CuraOS Website — Resume Log (single source to continue without deep analysis)

> **Purpose:** one file to resume any website work instantly — where the code lives, where it deploys, what the design system is, what git was done, and the exact commands to verify/publish. Update this file on every `CuraOS_Website/` or logo/design change. Related: `docs/AI_REPOSITORY_CONTEXT.md`, `docs/PWA_APPS_OPERATIONS_LOG.md` §12.

Last updated: **2026-09-06** · Private `verioralabs/CuraOS` HEAD **`bc25f58`** (site fix `c7d7914` → `bc25f58`) · Public `verioralabs/Website-Hositng-CuraOS.Health` **`97e22d5`** (prev `eeafd0e`) · Branch `main` both. Logo fixed: `CuraOS_Logo-D.png` 821KB replaces corrupted `logo.svg` 3518.

## TL;DR Resume

```bash
# 1. Edit standalone site (no build)
code CuraOS_Website/index.html  # hero/modules/pricing use media/CuraOS_Logo-D.png + bg-brand-pastel
code CuraOS_Website/css/style.css   # pastel tokens #EAF4FF #F4EAFE #FBFBFE #0F172A
code CuraOS_Website/js/main.js      # beforeinstallprompt + iOS modal
# preview: open CuraOS_Website/index.html in browser or
#   npx serve CuraOS_Website  (or python -m http.server --directory CuraOS_Website 8000)

# 2. Commit private repo (source of truth)
git add CuraOS_Website frontend/public/media/CuraOS_Logo-D.png
git commit -m "feat(website): <what changed>"
git push origin main   # → https://github.com/verioralabs/CuraOS

# 3. Publish public Pages (copy of CuraOS_Website → root of public repo)
#    Public repo = https://github.com/verioralabs/Website-Hositng-CuraOS.Health (typo Hositng is canonical)
#    Pages serves main → / (root), custom domain curaos.health via CANCE
git clone https://github.com/verioralabs/Website-Hositng-CuraOS.Health.git C:\Temp\public_site
robocopy CuraOS_Website C:\Temp\public_site /E
# (in C:\Temp\public_site)
git add -A; git commit -m "feat(website): publish <what>"
git push origin main   # → live in ~30s at https://curaos.health (check Actions → Pages)

# 4. Verify
python backend/manage.py check                              # 0 issues
Set-Location frontend; npx tsc --noEmit --skipLibCheck      # 0 (or npm run build TS pass)
npm run build                                               # 136 routes
$env:NEXT_STATIC_EXPORT="1"; npm run build; Remove-Item Env:\NEXT_STATIC_EXPORT  # out/ + pastel HTML
npx playwright test --list                                  # 12 specs
```

---

## 1. Where we are (2026-09-06)

| What | Status | SHA / Path |
|---|---|---|
| Logo-1 (provided image) | ✅ **Fixed** — corrupted `logo.svg` 3518 replaced with correct `CuraOS_Logo-D.png` 821921 | `CuraOS_Website/assets/CuraOS_Logo-D.png` ✅ (verified 821921) + `assets/logo.png` alias + `media/CuraOS_Logo-D.png` + `media/logo.png`, mirrored to `frontend/public/media/CuraOS_Logo-D.png` + `frontend/public/media/logo.png` + `frontend/public/CuraOS_Logo-D.png` — header/hero/footer/phone now `<img src="media/CuraOS_Logo-D.png">` (`index.html:9` icon, `:22` brand, `:76` hero, `:258` phone, `:274` footer; `manifest.json:10` + `sw.js:2` precache). Deleted corrupted `media/logo.svg`, `media/logo-1.svg`, `assets/logo.svg`, `frontend/public/*.svg`. |
| Standalone site | ✅ Shipped + fixed | `CuraOS_Website/` pure HTML/CSS/JS, no Next.js. Private `c7d7914` → `bc25f58` (logo fix), public `eeafd0e` → `97e22d5` (logo fix). |
| Pastel system (site + app) | ✅ Shipped | `frontend/src/app/globals.css:4` `@theme inline` `pastel-sky #EAF4FF` `pastel-lavender #F4EAFE` `pastel-base #FBFBFE` `brand-dark #0F172A` + `.bg-brand-pastel` gradient + `.shadow-floating-card`; mirrored in `CuraOS_Website/css/style.css:1` `:root` same tokens. |
| Private source of truth | ✅ `a44459d` | `https://github.com/verioralabs/CuraOS` `main` `origin/main` |
| Public Pages deploy | ✅ `eeafd0e` | `https://github.com/verioralabs/Website-Hositng-CuraOS.Health` `main` `origin/main` cloned to `C:\Users\zaref\AppData\Local\Temp\opencode\public_site` → live at `https://curaos.health` + `https://verioralabs.github.io/Website-Hositng-CuraOS.Health/` |
| Ops logs | ✅ Updated | `docs/PWA_APPS_OPERATIONS_LOG.md` §12, `docs/AI_REPOSITORY_CONTEXT.md` §3 diagram, `README.md:15` AI Collaborators reference |

## 2. File Inventory (copy-paste paths)

```
CuraOS_Website/
  index.html        178xx  hero bg-brand-pastel, 4 modules + pricing + PWA + footer; header <img src="media/CuraOS_Logo-D.png"> (was media/logo.svg 3518 — FIXED to PNG 821921)
  css/style.css     11307  :root pastel tokens, .bg-brand-pastel, .shadow-floating-card, responsive grid-2/3, header/hero/cards/phone/modal
  js/main.js         3288  PWA: beforeinstallprompt intercept (deferred), Install App btns (pwaInstallBtn/heroInstallBtn/pwaInstallInline), isIOS() /iPad|iPhone|iPod/, iOS modal Share→Add to Home, isStandalone() hide, hamburger, sw.js register
  media/CuraOS_Logo-D.png 821921  ✅ correct logo (gradient C + stethoscope + ECG) — replaces corrupted media/logo.svg 3518
  media/logo.png     821921  alias (copy of CuraOS_Logo-D.png) — keep for short path
  assets/CuraOS_Logo-D.png 821921  ✅ original paste location D:\Z_Hospital_management\CuraOS\CuraOS_Website\assets\CuraOS_Logo-D.png
  assets/logo.png    821921  alias
  manifest.json       49x  name CuraOS — Hospital OS, start_url "/", display standalone, icons media/CuraOS_Logo-D.png (was media/logo.svg)
  sw.js              74x  CACHE curaos-site-v1, precache index/css/js/media/CuraOS_Logo-D.png/manifest
  CNAME                14  curaos.health
  .nojekyll             0  bypass Jekyll
  [DELETED corrupted] media/logo.svg 3518, media/logo-1.svg 3518, assets/logo.svg 3518 — removed in bc25f58

Private repo mirrors:
  frontend/public/media/CuraOS_Logo-D.png 821921  app can use <img src="/media/CuraOS_Logo-D.png">
  frontend/public/media/logo.png          821921  alias
  frontend/public/CuraOS_Logo-D.png       821921  alias at root
  [DELETED] frontend/public/media/logo.svg, frontend/public/logo.svg 3518
  docs/AI_REPOSITORY_CONTEXT.md     dual-repo diagram + GH_PAGES_DEPLOY_TOKEN
  docs/PWA_APPS_OPERATIONS_LOG.md   §1 / §12 + inventory now lists CuraOS_Website
  website_log.md (this file)        resume entrypoint
```

## 3. Repos & Rules (no analysis needed — just follow)

- **Private `verioralabs/CuraOS` `main` = source of truth** for ALL code, `CuraOS_Website/` marketing static site, `frontend/src/app/page.tsx` (Next.js marketing), brand SVG, backend. All AI edits happen here.
- **Public `verioralabs/Website-Hositng-CuraOS.Health` `main` = read-only static host** for GitHub Pages (`curaos.health` via `CNAME`). Never edit code there; `CuraOS_Website/` is source, `public_site/` is `robocopy` copy. Also has Next.js `out/` deploy via `.github/workflows/deploy_website.yml` on Next pushes — both paths coexist (static `index.html` from `CuraOS_Website` is Pages root; `out/` workflow would overwrite on `frontend/src/app/page.tsx` push — prefer editing `CuraOS_Website` for the static Pages site).
- **Workflow diagram:** `docs/AI_REPOSITORY_CONTEXT.md:45` + `README.md:15` instruction “read `AI_REPOSITORY_CONTEXT.md` first, never split marketing into separate repo”.

## 4. Logo — FIXED (corrupted SVG → correct PNG)

- **Origin:** user-provided `CuraOS_Logo-D.png` (blue/purple gradient C, white stethoscope ring, uraOS wordmark, ECG line, HOSPITAL OPERATING SYSTEM) pasted at `CuraOS_Website/assets/CuraOS_Logo-D.png` (821921 bytes, verified via `Get-ChildItem assets/CuraOS_Logo-D.png`). Previously saved as generated `logo.svg` 3518 was corrupted — replaced in `bc25f58`/`97e22d5`.
- **Files now:** `CuraOS_Website/assets/CuraOS_Logo-D.png` (canonical) + `assets/logo.png` alias + `media/CuraOS_Logo-D.png` + `media/logo.png` + `frontend/public/media/CuraOS_Logo-D.png` etc. All 821921, `git status` shows `D assets/logo.svg`, `D media/logo.svg`, `D frontend/public/*.svg` (deleted).
- **Usage:** site header `<img src="media/CuraOS_Logo-D.png" class="brand-logo">` `CuraOS_Website/index.html:22` (hero `:76`, phone `:258`, footer `:274`, icon `:9`), `manifest.json:10` + `sw.js:2` now `media/CuraOS_Logo-D.png` (was `media/logo.svg`). App header can use `<img src="/media/CuraOS_Logo-D.png">` when ready — file in `frontend/public/media/`.
- **Export:** original is PNG 821KB; to create favicon/192/512 `maskable`, resize `CuraOS_Logo-D.png` via `Chrome → export` or `%TEMP%/opencode/gen_icons.ps1` → `frontend/public/icons/` (existing 192/512 still valid, but now matches brand).

## 5. Design System (site + app share)

- **Tokens:** `pastel-sky #EAF4FF`, `pastel-lavender #F4EAFE`, `pastel-base #FBFBFE`, `brand-dark #0F172A` (`frontend/src/app/globals.css:4` + `CuraOS_Website/css/style.css:1` `:root`).
- **Utilities:** `.bg-brand-pastel {background: linear-gradient(135deg, #EAF4FF 0%, #F4EAFE 50%, #FFFFFF 100%);}` + `.shadow-floating-card {box-shadow: 0 10px 30px rgba(0,0,0,0.04);}` — hero + pricing + modules + PWA cards all `bg-white rounded-2xl (16px) shadow-floating-card` + headers `text-brand-dark`.
- **App shell:** `frontend/src/components/layout/AppShell.tsx:187` `bg-brand-pastel text-brand-dark` already, `frontend/src/app/page.tsx:41` `bg-brand-pastel`.

## 6. Git History (copy SHA to resume)

```
bc25f58 fix(website): replace corrupted logo.svg with correct CuraOS_Logo-D.png (821KB) — update website + app media assets and manifest/SW references
430c5db docs(website): add website_log.md resume log (single source to continue without deep analysis) — mirrors to docs/ and CuraOS_Website/
a44459d docs(ops): log CuraOS_Website standalone + logo-1 dual-repo publish (private c7d7914 → public eeafd0e)
c7d7914 feat(website): CuraOS_Website standalone HTML/CSS/JS with soft pastel system + logo-1 media asset (shared with app) for curaos.health
ed97853 feat(docs+brand): dual-repo AI context record + README reference + soft pastel tokens ...
```

Private pushes:
- `c7d7914..a44459d` → `a44459d..430c5db` → `430c5db..bc25f58  main -> main` `PUSH:0` (verified `git log --oneline -3`)
Public pushes:
- `7730dea..eeafd0e` `feat(website): publish CuraOS_Website standalone` → `eeafd0e..97e22d5` `fix(website): replace corrupted logo.svg with correct CuraOS_Logo-D.png` → `d343bff` WEBSITE_LOG sync → `main -> main` `PUSH:0` (verified in `C:\Users\zaref\AppData\Local\Temp\opencode\public_site`)

## 7. How to Resume — 3 Recipes (pick one, no deep analysis)

### A. Edit website copy/design/logo
```bash
# edit
code CuraOS_Website/index.html              # uses media/CuraOS_Logo-D.png 821921 (not logo.svg)
code CuraOS_Website/css/style.css   # tweak :root tokens or .bg-brand-pastel
# if logo changed, replace canonical PNG and mirror to app:
Copy-Item CuraOS_Website/assets/CuraOS_Logo-D.png CuraOS_Website/media/CuraOS_Logo-D.png -Force
Copy-Item CuraOS_Website/assets/CuraOS_Logo-D.png frontend/public/media/CuraOS_Logo-D.png -Force
# preview
Start-Process CuraOS_Website/index.html   # or npx serve CuraOS_Website
# publish — note .svg files are DELETED (bc25f58), do not re-add them:
git add CuraOS_Website frontend/public/media/CuraOS_Logo-D.png; git commit -m "feat(website): ..."; git push origin main
# public Pages (same robocopy + push as TL;DR #3 — robocopy will handle deletions via manual Remove-Item in public_site)
```

### B. Edit Next.js app (page.tsx / globals.css) — also update static site to keep parity
```bash
code frontend/src/app/page.tsx         # hero/modules must stay visually in sync with CuraOS_Website/index.html
code frontend/src/app/globals.css      # keep :root tokens identical to CuraOS_Website/css/style.css
# verify
python backend/manage.py check
Set-Location frontend; npx tsc --noEmit --skipLibCheck; npm run build
$env:NEXT_STATIC_EXPORT="1"; npm run build; Remove-Item Env:\NEXT_STATIC_EXPORT
# then also sync to CuraOS_Website if marketing hero changed, and republish as in A
```

### C. Just update ops/log
```bash
code website_log.md              # this file — add entry under §8
code docs/PWA_APPS_OPERATIONS_LOG.md  # §12 already has website row
git add website_log.md docs/PWA_APPS_OPERATIONS_LOG.md; git commit -m "docs(ops): ..."; git push origin main
```

## 8. Backlog (when resuming, pick top unchecked)

- [ ] Hook site `Install App` buttons to real `beforeinstallprompt` metrics (track acceptance vs iOS modal) — `CuraOS_Website/js/main.js:1` already does outcome handling, needs analytics ping.
- [ ] Replace footer placeholder pricing CTAs with real Stripe/offer links (`CuraOS_Website/index.html:140` pricing cards).
 - [ ] Make app header use new `media/CuraOS_Logo-D.png` instead of cross `Logo.tsx` when brand approval final (swap in `frontend/src/components/brand/Logo.tsx` or `TopBar.tsx` → `<img src="/media/CuraOS_Logo-D.png">`).
- [ ] Add `CuraOS_Website/og-image.png` (1200x630) from logo for social share + update `index.html` `<meta property="og:image">`.
- [ ] Pages settings check: `https://github.com/verioralabs/Website-Hositng-CuraOS.Health/settings/pages` → Source `Deploy from branch` `main` `/ (root)` → Custom domain `curaos.health` → Enforce HTTPS + verify `CNAME` still `curaos.health` after each push.
- [ ] If editing Next.js marketing instead of `CuraOS_Website`, remember dual deploy: Next push triggers `.github/workflows/deploy_website.yml` → `out/` → public repo (would overwrite static `index.html`); prefer `CuraOS_Website` for static Pages site.

## 9. Verification Checklist (run before every push)

```bash
# from repo root D:\Z_Hospital_management\CuraOS
python backend/manage.py check
Set-Location frontend
npx tsc --noEmit --skipLibCheck   # 0
npm run build                     # 136 routes
$env:NEXT_STATIC_EXPORT="1"; npm run build  # out/index.html contains bg-brand-pastel
Remove-Item Env:\NEXT_STATIC_EXPORT
npx playwright test --list        # 12 specs
# site specific — FIXED to PNG 821921 (was corrupted SVG 3518)
Select-String -Path CuraOS_Website/index.html -Pattern 'CuraOS_Logo-D.png'       # header + hero (5 refs)
Select-String -Path CuraOS_Website/css/style.css -Pattern 'EAF4FF|pastel'    # tokens
Test-Path CuraOS_Website/media/CuraOS_Logo-D.png; Test-Path CuraOS_Website/assets/CuraOS_Logo-D.png; Test-Path frontend/public/media/CuraOS_Logo-D.png  # all 821921
# public Pages live check (after push, ~30s)
curl.exe --noproxy "*" -s https://curaos.health/ | Select-String "CuraOS"
```

## 10. Troubleshooting — no analysis, just fix

| Symptom | Fix |
|---|---|
| `npx tsc --noEmit` TS2304 LayoutProps | Delete `frontend/.next` then `npm run build` regenerates types, rerun tsc |
| `NEXT_STATIC_EXPORT=1` not recognized in PowerShell | Use `$env:NEXT_STATIC_EXPORT="1"; npm run build; Remove-Item Env:\NEXT_STATIC_EXPORT` |
| Public Pages 404 / old content | Check `C:\Temp\public_site` push succeeded (`7730dea..eeafd0e`), verify Pages source is `main` `/ (root)`, hard refresh (`Ctrl+F5`), purge SW `CuraOS_Website/sw.js` version bump |
| Logo not updating on App | Hard copy: `Copy-Item CuraOS_Website/assets/CuraOS_Logo-D.png CuraOS_Website/media/CuraOS_Logo-D.png -Force; Copy-Item CuraOS_Website/assets/CuraOS_Logo-D.png frontend/public/media/CuraOS_Logo-D.png -Force` + `npm run build` — do NOT re-create `logo.svg` 3518 (deleted in bc25f58, was corrupted) |
| Want to revert website | `git log --oneline CuraOS_Website` → `git checkout c7d7914 -- CuraOS_Website` |

---
*This log is the resume entrypoint — if you need deep history, see `docs/PWA_APPS_OPERATIONS_LOG.md` §1-§12, `docs/AI_REPOSITORY_CONTEXT.md`, and `git log --oneline` above. Keep this file as the first file you open.*
