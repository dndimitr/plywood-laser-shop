# ЛазерШперплат — Design System Master

> Generated from UI UX Pro Max skill data (Python CLI unavailable — CSV + Quick Reference).
> Product: Custom laser-cut plywood e-commerce · Stack: Next.js 15

## Pattern
**Hero-Centric + Feature-Rich Showcase + Social Proof**
1. Full-bleed hero (brand + one CTA pair)
2. How it works (3 steps)
3. Catalog templates
4. Custom upload CTA band
5. Trust / delivery
6. FAQ

## Style
**Swiss Modernism 2.0 × Organic craft materials**
- Strict grid, high contrast, mathematical spacing
- Real workshop photography (no abstract purple gradients)
- Soft lift hover (200–250ms), no neon/glow

## Colors
| Token | Hex | Use |
|-------|-----|-----|
| `--bg` | `#E8E4DC` | Page (cool stone, not cream) |
| `--bg-deep` | `#D4CFC4` | Section alternate |
| `--surface` | `#FFFCF7` | Interactive panels |
| `--ink` | `#141210` | Text |
| `--ink-soft` | `#5A534A` | Secondary text |
| `--walnut` | `#3B2A1E` | Brand / headers |
| `--forest` | `#2F4A3C` | Secondary accent |
| `--laser` | `#C45C26` | Primary CTA (burnt copper) |
| `--laser-deep` | `#9A4018` | CTA hover |
| `--maple` | `#D4A017` | Highlights / prices |
| `--line` | `rgba(20,18,16,0.14)` | Borders |
| `--ok` | `#2F6B4F` | Success |
| `--error` | `#9B1C1C` | Errors |

**Anti-patterns:** AI purple gradients · cream+#terracotta cliché · dark-mode-by-default · emoji icons · flat depthless cards · text-heavy hero

## Typography
- **Display:** Onest (кирилица + cyrillic-ext) — заглавия и бранд
- **Body:** Source Sans 3 (кирилица + cyrillic-ext) — UI и дълъг текст
- Subsets: `latin`, `latin-ext`, `cyrillic`, `cyrillic-ext`
- Hero display: `clamp(2.35rem, 6.5vw, 4.4rem)`
- Avoid fonts without Cyrillic (e.g. Syne alone)

## Effects
- Hover lift: `translateY(-3px)` + soft shadow, 220ms
- Scroll reveal: fade-up 400ms, stagger 80ms
- Focus: 2px `--laser` outline offset 2px
- `prefers-reduced-motion: reduce` → disable transforms

## Spacing
8px rhythm: 8 / 16 / 24 / 32 / 48 / 64 / 96

## Components
- Buttons: primary (laser fill), ghost (ink border), no rounded-full pills
- Product tiles: interactive containers only (border + surface), image 4:3
- Forms: labeled fields, inline errors, 44px+ tap targets
- Sticky header with cart count + primary CTA

## Pre-delivery
- [ ] No emoji icons
- [ ] cursor-pointer on clickables
- [ ] Hover 150–300ms
- [ ] Contrast ≥4.5:1
- [ ] Focus visible
- [ ] Reduced motion
- [ ] Responsive 375 / 768 / 1024 / 1440
