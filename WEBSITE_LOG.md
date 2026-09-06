# CuraOS Website — Resume Log (single source to continue without deep analysis)

> **Purpose:** one file to resume any website work instantly — where the code lives, where it deploys, what the design system is, what git was done, and the exact commands to verify/publish. Update this file on every `CuraOS_Website/` or logo/design change. Related: `docs/AI_REPOSITORY_CONTEXT.md`, `docs/PWA_APPS_OPERATIONS_LOG.md` §12.

Last updated: **2026-09-06** · Private `verioralabs/CuraOS` HEAD **`a44459d`** (site code `c7d7914`) · Public `verioralabs/Website-Hositng-CuraOS.Health` **`eeafd0e`** · Branch `main` both.

## TL;DR Resume

```bash
# 1. Edit standalone site (no build)
code CuraOS_Website/index.html  # hero/modules/pricing use media/logo.svg + bg-brand-pastel
code CuraOS_Website/css/style.css   # pastel tokens #EAF4FF #F4EAFE #FBFBFE #0F172A
code CuraOS_Website/js/main.js      # beforeinstallprompt + iOS modal
# preview: open CuraOS_Website/index.html in browser or
#   npx serve CuraOS_Website  (or python -m http.server --directory CuraOS_Website 8000)

# 2. Commit private repo (source of truth)
git add CuraOS_Website frontend/public/media/logo.svg
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
| Logo-1 (provided image) | ✅ Saved as SVG | `CuraOS_Website/media/logo.svg` (3518 bytes), `media/logo-1.svg` (alias), `assets/logo.svg`, mirrored to `frontend/public/media/logo.svg` + `frontend/public/logo.svg` — shared by app + site header/hero/footer/phone. `frontend/src/components/brand/Logo.tsx` legacy cross kept intact. |
| Standalone site | ✅ Shipped | `CuraOS_Website/` pure HTML/CSS/JS, no Next.js, no build step. Pushed private `c7d7914`, public `eeafd0e`. |
| Pastel system (site + app) | ✅ Shipped | `frontend/src/app/globals.css:4` `@theme inline` `pastel-sky #EAF4FF` `pastel-lavender #F4EAFE` `pastel-base #FBFBFE` `brand-dark #0F172A` + `.bg-brand-pastel` gradient + `.shadow-floating-card`; mirrored in `CuraOS_Website/css/style.css:1` `:root` same tokens. |
| Private source of truth | ✅ `a44459d` | `https://github.com/verioralabs/CuraOS` `main` `origin/main` |
| Public Pages deploy | ✅ `eeafd0e` | `https://github.com/verioralabs/Website-Hositng-CuraOS.Health` `main` `origin/main` cloned to `C:\Users\zaref\AppData\Local\Temp\opencode\public_site` → live at `https://curaos.health` + `https://verioralabs.github.io/Website-Hositng-CuraOS.Health/` |
| Ops logs | ✅ Updated | `docs/PWA_APPS_OPERATIONS_LOG.md` §12, `docs/AI_REPOSITORY_CONTEXT.md` §3 diagram, `README.md:15` AI Collaborators reference |

## 2. File Inventory (copy-paste paths)

```
CuraOS_Website/
  index.html        17839  hero bg-brand-pastel, 4 modules + pricing + PWA + footer; header <img src="media/logo.svg">
  css/style.css     11307  :root pastel tokens, .bg-brand-pastel, .shadow-floating-card, responsive grid-2/3, header/hero/cards/phone/modal
  js/main.js         3288  PWA: beforeinstallprompt intercept (deferred), Install App btns (pwaInstallBtn/heroInstallBtn/pwaInstallInline), isIOS() /iPad|iPhone|iPod/, iOS modal Share→Add to Home, isStandalone() hide, hamburger, sw.js register
  media/logo.svg     3518  gradient C-mark (url(#c-grad) #00D1FF→#B94DFF) + white ring 54 + inner blue url(#inner-blue) + stethoscope white stroke, wordmark ura (brand-dark) + OS (url(#os-grad)), line url(#line-grad), HOSPITAL OPERATING SYSTEM
  media/logo-1.svg   3518  identical alias (user named logo-1)
  assets/logo.svg    3518  identical alias for site assets
  manifest.json       494  name CuraOS — Hospital OS, start_url "/", display standalone, icons media/logo.svg
  sw.js               748  CACHE curaos-site-v1, precache index/css/js/logo/manifest, cache-first
  CNAME                14  curaos.health
  .nojekyll             0  bypass Jekyll

Private repo mirrors:
  frontend/public/media/logo.svg  3518  same file — app can use <img src="/media/logo.svg"> or /logo.svg
  frontend/public/logo.svg        3518
  docs/AI_REPOSITORY_CONTEXT.md     dual-repo diagram + GH_PAGES_DEPLOY_TOKEN
  docs/PWA_APPS_OPERATIONS_LOG.md   §1 / §12 + inventory now lists CuraOS_Website
  website_log.md (this file)        resume entrypoint
```

## 3. Repos & Rules (no analysis needed — just follow)

- **Private `verioralabs/CuraOS` `main` = source of truth** for ALL code, `CuraOS_Website/` marketing static site, `frontend/src/app/page.tsx` (Next.js marketing), brand SVG, backend. All AI edits happen here.
- **Public `verioralabs/Website-Hositng-CuraOS.Health` `main` = read-only static host** for GitHub Pages (`curaos.health` via `CNAME`). Never edit code there; `CuraOS_Website/` is source, `public_site/` is `robocopy` copy. Also has Next.js `out/` deploy via `.github/workflows/deploy_website.yml` on Next pushes — both paths coexist (static `index.html` from `CuraOS_Website` is Pages root; `out/` workflow would overwrite on `frontend/src/app/page.tsx` push — prefer editing `CuraOS_Website` for the static Pages site).
- **Workflow diagram:** `docs/AI_REPOSITORY_CONTEXT.md:45` + `README.md:15` instruction “read `AI_REPOSITORY_CONTEXT.md` first, never split marketing into separate repo”.

## 4. Logo

- **Origin:** user upload in chat (blue/purple gradient C, white stethoscope ring, uraOS wordmark, ECG line, HOSPITAL OPERATING SYSTEM). Saved as SVG above — pure vector, no raster, scales to 16px favicon through 512px PWA icon.
- **Usage:** site header `<img src="media/logo.svg" class="brand-logo" alt="CuraOS — Hospital Operating System">` `CuraOS_Website/index.html:22`, hero `hero-logo`, footer, phone mock. App header could swap `frontend/src/components/brand/Logo.tsx` cross for `<img src="/media/logo.svg">` when ready — file already in `frontend/public/media/`.
- **Export:** to regenerate PNG sizes, open `media/logo.svg` in Chrome → export 192/512 or `npx sharp` / `%TEMP%/opencode/gen_icons.ps1`.

## 5. Design System (site + app share)

- **Tokens:** `pastel-sky #EAF4FF`, `pastel-lavender #F4EAFE`, `pastel-base #FBFBFE`, `brand-dark #0F172A` (`frontend/src/app/globals.css:4` + `CuraOS_Website/css/style.css:1` `:root`).
- **Utilities:** `.bg-brand-pastel {background: linear-gradient(135deg, #EAF4FF 0%, #F4EAFE 50%, #FFFFFF 100%);}` + `.shadow-floating-card {box-shadow: 0 10px 30px rgba(0,0,0,0.04);}` — hero + pricing + modules + PWA cards all `bg-white rounded-2xl (16px) shadow-floating-card` + headers `text-brand-dark`.
- **App shell:** `frontend/src/components/layout/AppShell.tsx:187` `bg-brand-pastel text-brand-dark` already, `frontend/src/app/page.tsx:41` `bg-brand-pastel`.

## 6. Git History (copy SHA to resume)

```
a44459d docs(ops): log CuraOS_Website standalone + logo-1 dual-repo publish (private c7d7914 → public eeafd0e)
c7d7914 feat(website): CuraOS_Website standalone HTML/CSS/JS with soft pastel system + logo-1 media asset (shared with app) for curaos.health
ed97853 feat(docs+brand): dual-repo AI context record + README reference + soft pastel tokens ...
1430fb6 feat(pwa): web-first custom PWA install engine (beforeinstallprompt intercept ...)
998a57c feat(shell): entitlement-driven AppSidebar + pharmacy/admin alias ...
```

Private push: `git push origin main` (was `fb05c83..a44459d  main -> main` `PUSH:0`)
Public push: `git clone https://github.com/verioralabs/Website-Hositng-CuraOS.Health.git` → `robocopy` → `eeafd0e feat(website): publish ...` → `git push origin main` `7730dea..eeafd0e`

## 7. How to Resume — 3 Recipes (pick one, no deep analysis)

### A. Edit website copy/design/logo
```bash
# edit
code CuraOS_Website/index.html
code CuraOS_Website/css/style.css   # tweak :root tokens or .bg-brand-pastel
# if logo changed, export again and copy to both:
Copy-Item CuraOS_Website/media/logo.svg frontend/public/media/logo.svg -Force
# preview
Start-Process CuraOS_Website/index.html   # or npx serve CuraOS_Website
# publish
git add CuraOS_Website frontend/public/media/logo.svg; git commit -m "feat(website): ..."; git push origin main
# public Pages (same robocopy + push as TL;DR #3)
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
- [ ] Make app header use new `media/logo.svg` instead of cross `Logo.tsx` when brand approval final (swap in `frontend/src/components/brand/Logo.tsx` or `TopBar.tsx`).
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
# site specific
Select-String -Path CuraOS_Website/index.html -Pattern 'media/logo.svg'       # header + hero
Select-String -Path CuraOS_Website/css/style.css -Pattern 'EAF4FF|pastel'    # tokens
Test-Path CuraOS_Website/media/logo.svg; Test-Path frontend/public/media/logo.svg
# public Pages live check (after push, ~30s)
curl.exe --noproxy "*" -s https://curaos.health/ | Select-String "CuraOS"
```

## 10. Troubleshooting — no analysis, just fix

| Symptom | Fix |
|---|---|
| `npx tsc --noEmit` TS2304 LayoutProps | Delete `frontend/.next` then `npm run build` regenerates types, rerun tsc |
| `NEXT_STATIC_EXPORT=1` not recognized in PowerShell | Use `$env:NEXT_STATIC_EXPORT="1"; npm run build; Remove-Item Env:\NEXT_STATIC_EXPORT` |
| Public Pages 404 / old content | Check `C:\Temp\public_site` push succeeded (`7730dea..eeafd0e`), verify Pages source is `main` `/ (root)`, hard refresh (`Ctrl+F5`), purge SW `CuraOS_Website/sw.js` version bump |
| Logo not updating on App | Hard copy: `Copy-Item CuraOS_Website/media/logo.svg frontend/public/media/logo.svg -Force; Copy-Item frontend/public/media/logo.svg frontend/public/logo.svg -Force` + `npm run build` |
| Want to revert website | `git log --oneline CuraOS_Website` → `git checkout c7d7914 -- CuraOS_Website` |

---
*This log is the resume entrypoint — if you need deep history, see `docs/PWA_APPS_OPERATIONS_LOG.md` §1-§12, `docs/AI_REPOSITORY_CONTEXT.md`, and `git log --oneline` above. Keep this file as the first file you open.*
