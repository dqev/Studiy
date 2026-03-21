---
name: dark-glassy-dashboard
description: >
  Build complete glassy dashboard UIs as standalone HTML files — including sidebars, topbars,
  stat cards, content panels, and interactive nav — in a pure monochrome glass aesthetic with
  both dark and light themes, desktop sidebar collapse, and mobile responsiveness. Use this
  skill whenever the user asks to build a dashboard, admin panel, SaaS UI, or any multi-section
  web layout. Also use when converting an existing dashboard screenshot into this glassy style,
  or when requesting "dark mode", "light mode", "glassmorphism", "frosted glass", "glassy sidebar",
  or "dark/light theme toggle". Trigger even for partial requests like "add a sidebar", "make it
  glassy", or "show me a dashboard". The output is always a single self-contained .html file
  with working theme toggle, desktop sidebar open/close inside the sidebar itself, and mobile
  hamburger drawer.
---

# Dark & Light Glassy Dashboard Skill

Produces complete, production-grade dashboard UIs in a monochrome glass aesthetic.
Output is always a **single self-contained HTML file** — no external dependencies except Google Fonts.
Always includes: dual dark/light theme, desktop sidebar collapse, mobile slide-out drawer.

---

## Design System

### Dual Theme Tokens — always implement both

Use `data-theme="dark"` on `<html>` by default. All colors are CSS variables — never hardcoded.

```css
:root, [data-theme="dark"] {
  --bg:               #0e0e10;
  --surface:          rgba(24,24,28,0.92);
  --sidebar-bg:       rgba(16,16,20,0.98);
  --topbar-bg:        rgba(14,14,16,0.88);
  --border:           rgba(255,255,255,0.07);
  --border-mid:       rgba(255,255,255,0.11);
  --border-top:       rgba(255,255,255,0.16);
  --text-primary:     #ececee;
  --text-secondary:   rgba(255,255,255,0.38);
  --text-muted:       rgba(255,255,255,0.22);
  --icon-stroke:      rgba(255,255,255,0.5);
  --active-bg-start:  rgba(255,255,255,0.13);
  --active-bg-mid:    rgba(255,255,255,0.06);
  --active-bg-end:    rgba(255,255,255,0.03);
  --active-border-top:rgba(255,255,255,0.32);
  --active-border-l:  rgba(255,255,255,0.16);
  --active-border-sm: rgba(255,255,255,0.03);
  --shine-mid:        rgba(255,255,255,0.78);
  --shine-side:       rgba(255,255,255,0.55);
  --card-shadow:      0 8px 28px rgba(0,0,0,0.35);
  --card-inset:       inset 0 1px 0 rgba(255,255,255,0.05);
  --topbar-border-top:rgba(255,255,255,0.22);
  --btn-primary-bg:   rgba(255,255,255,0.08);
  --progress-fill:    rgba(255,255,255,0.28);
  --scroll-color:     rgba(255,255,255,0.1);
}

[data-theme="light"] {
  /* Light theme — all borders are dark-alpha, never white */
  --bg:               #f8f9fc;   /* matches topbar bg so content feels unified */
  --surface:          rgba(255,255,255,0.75);
  --sidebar-bg:       rgba(252,252,254,0.92);
  --topbar-bg:        rgba(248,249,252,0.88);
  --border:           rgba(0,0,0,0.09);   /* dark-alpha — visible on light bg */
  --border-mid:       rgba(0,0,0,0.13);
  --border-top:       rgba(0,0,0,0.06);   /* slightly lighter for subtle depth */
  --text-primary:     #18181c;
  --text-secondary:   rgba(0,0,0,0.45);
  --text-muted:       rgba(0,0,0,0.30);
  --icon-stroke:      rgba(0,0,0,0.45);
  --active-bg-start:  rgba(0,0,0,0.06);
  --active-bg-mid:    rgba(0,0,0,0.04);
  --active-bg-end:    rgba(0,0,0,0.02);
  --active-border-top:rgba(255,255,255,0.80);
  --active-border-l:  rgba(255,255,255,0.55);
  --active-border-sm: rgba(0,0,0,0.05);
  --shine-mid:        rgba(255,255,255,0.9);
  --shine-side:       rgba(255,255,255,0.5);
  --card-shadow:      0 2px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06);
  --card-inset:       inset 0 1px 0 rgba(255,255,255,0.85);
  --topbar-border-top:rgba(255,255,255,0.80);
  --btn-primary-bg:   rgba(255,255,255,0.60);
  --progress-fill:    rgba(0,0,0,0.25);
  --scroll-color:     rgba(0,0,0,0.12);
}
```

**Critical light theme rule:** Never use `rgba(255,255,255,*)` for `--border`, `--border-mid`, or `--border-top` in light mode — white borders are invisible on white surfaces. Always use `rgba(0,0,0,alpha)` for borders in light mode.

Add smooth transitions to body, sidebar, topbar, and all cards:
```css
body, .sidebar, .topbar, .stat-card, .glass-card {
  transition: background 0.3s cubic-bezier(.4,0,.2,1), color 0.3s, border-color 0.3s, box-shadow 0.3s;
}
```

### Theme toggle button
```html
<button class="theme-btn" onclick="toggleTheme()">
  <svg id="iconMoon" width="15" height="15" viewBox="0 0 24 24" fill="none">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
  <svg id="iconSun" width="15" height="15" viewBox="0 0 24 24" fill="none" style="display:none">
    <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2"/>
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </svg>
</button>
```
```js
function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? 'light' : 'dark');
  document.getElementById('iconMoon').style.display = isDark ? 'none' : '';
  document.getElementById('iconSun').style.display  = isDark ? '' : 'none';
}
```

### Typography
- Font: **DM Sans** via Google Fonts (`wght@400;500;600;700`)
- Page title: 23px, weight 700, letter-spacing -0.03em, `color: var(--text-primary)`
- Card headings: 15px, weight 600
- Nav items / body: 14px, weight 500
- Labels / meta: 12–13px, weight 500, `color: var(--text-secondary)`
- Micro labels: 10px, weight 600, letter-spacing 0.1em, `color: var(--text-muted)`

---

## Desktop Sidebar Collapse

The sidebar toggle button lives **inside the sidebar** (next to the logo), NOT in the topbar.

```
:root { --sidebar-w: 236px; --sidebar-icon: 64px; --tr: 0.3s cubic-bezier(.4,0,.2,1); }
```

### Logo row with inline toggle
```html
<div class="logo-row">
  <div class="logo-icon"><!-- app SVG icon --></div>
  <span class="logo-text">App Name</span>
  <!-- Collapse button — visible when expanded -->
  <button class="sb-toggle" onclick="toggleDesktopSidebar()">
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path d="M3 12H15M3 6H21M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </button>
</div>
<!-- Re-open button — visible when collapsed, centered -->
<button class="sb-reopen" onclick="toggleDesktopSidebar()">
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
    <path d="M3 12H15M3 6H21M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</button>
```

```css
.logo-row { display: flex; align-items: center; gap: 8px; padding: 0 4px 24px; overflow: hidden; }
.logo-icon { width: 28px; height: 28px; flex-shrink: 0; border-radius: 8px; background: var(--border-mid); border: 1px solid var(--border-top); display: flex; align-items: center; justify-content: center; }
.logo-text { font-size: 16px; font-weight: 700; color: var(--text-primary); white-space: nowrap; flex: 1; }

.sb-toggle {
  width: 24px; height: 24px; border-radius: 7px; flex-shrink: 0; margin-left: auto;
  background: transparent; border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--text-muted); transition: all 0.15s;
}
.sb-toggle:hover { background: var(--border-mid); color: var(--text-primary); }

.sb-reopen {
  display: none; width: 24px; height: 24px; border-radius: 7px;
  background: transparent; border: 1px solid var(--border);
  align-items: center; justify-content: center;
  cursor: pointer; color: var(--text-muted); transition: all 0.15s;
  margin: 0 auto 24px;
}
.sb-reopen:hover { background: var(--border-mid); color: var(--text-primary); }

/* Collapsed state */
.sidebar { width: var(--sidebar-w); overflow: hidden; transition: width var(--tr); }
body.sidebar-collapsed .sidebar { width: var(--sidebar-icon); }

/* Fade out text when collapsed */
body.sidebar-collapsed .logo-text,
body.sidebar-collapsed .sb-toggle { opacity: 0; max-width: 0; overflow: hidden; pointer-events: none; }
body.sidebar-collapsed .nav-label { opacity: 0; max-width: 0; overflow: hidden; }
body.sidebar-collapsed .menu-label { opacity: 0; max-height: 0; margin-bottom: 0; padding: 0; }
body.sidebar-collapsed .sidebar-footer { opacity: 0; max-height: 0; padding: 0; }
body.sidebar-collapsed .sb-reopen { display: flex; }

/* Center icons when collapsed — padding: 0, justify: center fills the 64px width */
body.sidebar-collapsed .nav-item { padding: 9px 0; gap: 0; justify-content: center; }
body.sidebar-collapsed .logo-row { justify-content: center; }
```

Wrap each nav text in `<span class="nav-label">`, footer in `.sidebar-footer`. Nav items use `gap: 10px` when expanded, `gap: 0` collapsed.

```js
function toggleDesktopSidebar() { document.body.classList.toggle('sidebar-collapsed'); }
```

On mobile (`≤768px`): hide both `.sb-toggle` and `.sb-reopen` with `display: none !important`.

---

## Topbar

**No bottom border.** The topbar blends into the content area.

```css
.topbar {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 20px;               /* no border-bottom */
  background: var(--topbar-bg); backdrop-filter: blur(12px);
  position: sticky; top: 0; z-index: 10;
  transition: background var(--tr);
}
.topbar-right { display: flex; align-items: center; gap: 10px; margin-left: auto; }
```

### Topbar button system — all buttons must be exactly 36px tall and visually identical

Every button in the topbar shares the same glassy treatment:
- `height: 36px`
- `border-radius: 10px`
- `background: var(--btn-primary-bg)`
- `border: 1px solid var(--border)` + `border-top-color: var(--topbar-border-top)` (glassy lift)
- `box-shadow: inset 0 1px 0 rgba(255,255,255,0.07)` (inner shine)

```css
/* Icon-only buttons (search, theme, hamburger) */
.icon-btn, .theme-btn, .menu-btn {
  width: 36px; height: 36px; border-radius: 10px;
  background: var(--btn-primary-bg); border: 1px solid var(--border);
  border-top-color: var(--topbar-border-top);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--text-secondary); flex-shrink: 0; transition: all 0.15s;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.07);
}

/* Text buttons */
.topbar-btn {
  height: 36px; padding: 0 14px; border-radius: 10px;
  background: var(--btn-primary-bg); border: 1px solid var(--border);
  border-top-color: var(--topbar-border-top);
  color: var(--text-secondary); font-size: 13px; font-weight: 500;
  display: flex; align-items: center; gap: 7px;
  cursor: pointer; font-family: 'DM Sans', sans-serif; white-space: nowrap;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.07); transition: all 0.15s;
}
.topbar-btn.primary { color: var(--text-primary); border-color: var(--border-mid); }

/* User chip */
.user-chip {
  height: 36px; padding: 0 12px 0 6px; border-radius: 10px;
  background: var(--btn-primary-bg); border: 1px solid var(--border);
  border-top-color: var(--topbar-border-top);
  display: flex; align-items: center; gap: 8px;
  cursor: pointer; flex-shrink: 0;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.07); transition: all 0.15s;
}
```

Hover for all: `background: var(--border-mid); color: var(--text-primary)`.

### Mobile hamburger
```css
.menu-btn { display: none; /* ... same 36px style as above */ }
@media (max-width: 768px) { .menu-btn { display: flex; } }
```
Place `.menu-btn` as first child of `.topbar` (before `.topbar-right`). On mobile it triggers `openSidebar()`.

---

## Component Library

### Sidebar

```css
.sidebar {
  width: var(--sidebar-w); min-height: 100vh;
  background: var(--sidebar-bg); backdrop-filter: blur(24px);
  border-right: 1px solid var(--border);
  display: flex; flex-direction: column;
  padding: 20px 10px; flex-shrink: 0; overflow: hidden;
  transition: width var(--tr), background var(--tr), border-color var(--tr);
}
```

### Nav items

```css
.nav-item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 10px; border-radius: 12px; margin-bottom: 2px;
  color: var(--text-secondary); font-size: 14px; font-weight: 500;
  position: relative; border: 1px solid transparent;
  transition: background 0.15s, color 0.15s, padding var(--tr), gap var(--tr);
  cursor: pointer; overflow: hidden; white-space: nowrap;
}
.nav-item:hover { background: var(--active-bg-mid); color: var(--text-primary); }

/* Active — glossy glass + shining edge */
.nav-item.active {
  color: var(--text-primary);
  background: linear-gradient(135deg, var(--active-bg-start) 0%, var(--active-bg-mid) 50%, var(--active-bg-end) 100%);
  border-top: 1px solid var(--active-border-top);
  border-left: 1px solid var(--active-border-l);
  border-right: 1px solid var(--active-border-sm);
  border-bottom: 1px solid var(--active-border-sm);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.15), inset 1px 0 0 rgba(255,255,255,0.08), 0 2px 8px rgba(0,0,0,0.12);
}
/* Glossy streak across top edge */
.nav-item.active::before {
  content: ''; position: absolute; top: 0; left: 8px; right: 8px; height: 1px;
  background: linear-gradient(90deg, transparent, var(--shine-side) 30%, var(--shine-mid) 50%, var(--shine-side) 70%, transparent);
  border-radius: 99px;
}
/* Inner sheen sweep */
.nav-item.active::after {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 50%;
  border-radius: 12px 12px 0 0;
  background: linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 100%);
  pointer-events: none;
}

.nav-icon { width: 17px; height: 17px; flex-shrink: 0; opacity: 0.42; transition: opacity 0.15s; }
.nav-item.active .nav-icon { opacity: 1; }
.nav-item:hover .nav-icon { opacity: 0.75; }
.nav-label { white-space: nowrap; }
```

### Stat cards

```css
.stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-bottom: 20px; }

.stat-card {
  background: var(--surface); backdrop-filter: blur(16px);
  border: 1px solid var(--border); border-top-color: var(--border-top);
  border-radius: var(--radius-md); padding: 18px 20px;
  position: relative; overflow: hidden;
  box-shadow: var(--card-shadow), var(--card-inset);
  transition: transform 0.15s, background var(--tr), border-color var(--tr), box-shadow var(--tr);
}
.stat-card:hover { transform: translateY(-2px); }
.stat-card::before {
  content: ''; position: absolute; top: 0; left: 10px; right: 10px; height: 1px;
  background: linear-gradient(90deg, transparent, var(--shine-side) 50%, transparent); opacity: 0.6;
}
.stat-icon {
  width: 32px; height: 32px; border-radius: 9px;
  background: var(--border-mid); border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center; margin-bottom: 12px;
}
.stat-label { font-size: 12px; color: var(--text-secondary); font-weight: 500; margin-bottom: 3px; }
.stat-value { font-size: 26px; font-weight: 700; letter-spacing: -0.03em; color: var(--text-primary); }
```

### Glass content cards

```css
.glass-card {
  background: var(--surface); backdrop-filter: blur(16px);
  border: 1px solid var(--border); border-top-color: var(--border-top);
  border-radius: var(--radius-lg); padding: 20px 22px;
  position: relative; overflow: hidden;
  box-shadow: var(--card-shadow), var(--card-inset);
  transition: background var(--tr), border-color var(--tr), box-shadow var(--tr);
}
.glass-card::before {
  content: ''; position: absolute; top: 0; left: 12px; right: 12px; height: 1px;
  background: linear-gradient(90deg, transparent, var(--shine-side) 50%, transparent); opacity: 0.6;
}
```

---

## HTML Structure

```html
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>App — Dashboard</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>
  <style>/* all CSS inline */</style>
</head>
<body>

  <div class="overlay" id="overlay" onclick="closeSidebar()"></div>

  <aside class="sidebar" id="sidebar">
    <!-- Logo + collapse toggle in same row -->
    <div class="logo-row">
      <div class="logo-icon"><!-- icon SVG --></div>
      <span class="logo-text">App Name</span>
      <button class="sb-toggle" onclick="toggleDesktopSidebar()"><!-- menu SVG --></button>
    </div>
    <!-- Re-open button shown when collapsed -->
    <button class="sb-reopen" onclick="toggleDesktopSidebar()"><!-- menu SVG --></button>

    <div class="menu-label">MENU</div>

    <!-- nav-items: onclick="setActive(this); closeSidebar()" -->
    <div class="nav-item active" onclick="setActive(this);closeSidebar()">
      <svg class="nav-icon">...</svg>
      <span class="nav-label">Dashboard</span>
    </div>
    <!-- more nav items -->

    <div class="divider"></div>
    <!-- more nav items -->

    <div class="sidebar-footer">
      <button class="request-btn">
        <svg>...</svg> Request a Resource
      </button>
    </div>
  </aside>

  <main class="main">
    <nav class="topbar">
      <!-- Mobile hamburger first — hidden on desktop -->
      <button class="menu-btn" onclick="openSidebar()"><!-- menu SVG --></button>
      <div class="topbar-right">
        <button class="icon-btn"><!-- search SVG --></button>
        <button class="topbar-btn"><span class="btn-label">Notifications</span></button>
        <button class="topbar-btn primary"><span class="btn-label">Upload</span></button>
        <button class="theme-btn" onclick="toggleTheme()"><!-- moon/sun SVGs --></button>
        <div class="user-chip">
          <div class="avatar">DC</div>
          <div class="user-info-text">
            <div class="user-name">username</div>
            <div class="user-role">role</div>
          </div>
        </div>
      </div>
    </nav>

    <div class="content">
      <div class="page-header"><h1>Hi, user!</h1><p>subtitle</p></div>
      <div class="stats-grid"><!-- 4× .stat-card --></div>
      <div class="bottom-row" style="display:grid; grid-template-columns:1fr 310px; gap:14px;">
        <div class="glass-card"><!-- main content --></div>
        <div class="glass-card"><!-- side panel --></div>
      </div>
    </div>
  </main>

  <script>
    function setActive(el) {
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      el.classList.add('active');
    }
    function openSidebar() {
      document.getElementById('sidebar').classList.add('open');
      document.getElementById('overlay').classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closeSidebar() {
      if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('overlay').classList.remove('open');
        document.body.style.overflow = '';
      }
    }
    function toggleDesktopSidebar() { document.body.classList.toggle('sidebar-collapsed'); }
    function toggleTheme() {
      const html = document.documentElement;
      const isDark = html.getAttribute('data-theme') === 'dark';
      html.setAttribute('data-theme', isDark ? 'light' : 'dark');
      document.getElementById('iconMoon').style.display = isDark ? 'none' : '';
      document.getElementById('iconSun').style.display  = isDark ? '' : 'none';
    }
  </script>
</body>
</html>
```

---

## Mobile Responsiveness

```css
/* Mobile overlay */
.overlay { display:none; position:fixed; inset:0; z-index:40; background:rgba(0,0,0,0.5); backdrop-filter:blur(4px); }
.overlay.open { display:block; }

/* Sidebar slides in from left */
@media (max-width: 768px) {
  body { overflow: auto; }
  .sidebar {
    position: fixed; top:0; left:0; bottom:0;
    transform: translateX(-100%);
    width: min(var(--sidebar-w), 85vw) !important;
    transition: transform var(--tr) !important;
    z-index: 50;
  }
  .sidebar.open { transform: translateX(0); }

  /* Hide desktop-only controls in mobile sidebar */
  .sb-toggle { display: none !important; }
  .sb-reopen { display: none !important; }

  /* Reset collapsed state on mobile */
  body.sidebar-collapsed .sidebar { width: min(var(--sidebar-w), 85vw) !important; }
  body.sidebar-collapsed .logo-text,
  body.sidebar-collapsed .nav-label,
  body.sidebar-collapsed .menu-label,
  body.sidebar-collapsed .sidebar-footer { opacity: 1 !important; max-width: none !important; max-height: none !important; }
  body.sidebar-collapsed .nav-item { padding: 9px 10px !important; gap: 10px !important; justify-content: flex-start !important; }

  /* Show hamburger */
  .menu-btn { display: flex; }

  /* Topbar */
  .topbar { padding: 12px 16px; }
  /* Hide button text labels on mobile */
  .topbar-btn .btn-label { display: none; }
  .topbar-btn { padding: 0 10px; }
  /* Shrink user chip to avatar only */
  .user-info-text { display: none; }
  .user-chip { padding: 0 6px; }

  /* Content */
  .content { padding: 16px; }
  .stats-grid { grid-template-columns: repeat(2,1fr); gap: 10px; margin-bottom: 16px; }
  .stat-card { padding: 14px 16px; }
  .stat-value { font-size: 22px; }
  .page-header h1 { font-size: 19px; }
  .bottom-row { grid-template-columns: 1fr !important; }
}

@media (max-width: 1024px) {
  .bottom-row { grid-template-columns: 1fr; }
  .stats-grid { grid-template-columns: repeat(2,1fr); }
}
```

---

## Rules Checklist

- [ ] **No color** — only `rgba(0,0,0,alpha)` or `rgba(255,255,255,alpha)` — never named colors or hex except `#0e0e10`, `#ececee`, `#18181c`, `#f8f9fc`
- [ ] **Light theme borders are dark-alpha** — `rgba(0,0,0,0.09)` not `rgba(255,255,255,*)` — white borders are invisible on light backgrounds
- [ ] **`--bg` in light = `#f8f9fc`** — matches topbar so content area blends seamlessly
- [ ] **No topbar bottom border** — topbar blends into content
- [ ] **Sidebar toggle is inside the sidebar** next to logo — NOT in topbar
- [ ] **All topbar buttons are 36px tall** with same `border`, `border-top-color`, and `box-shadow` treatment
- [ ] **Mobile hamburger** `.menu-btn` is in topbar, `display:none` on desktop, `display:flex` on mobile
- [ ] **`.sb-toggle` and `.sb-reopen` hidden on mobile** with `display:none !important`
- [ ] **Active nav item** has 3 layers: gradient bg + asymmetric borders + `::before` shine streak + `::after` sheen
- [ ] **All glass cards** have `::before` edge highlight and `var(--card-inset)` box-shadow
- [ ] **Single HTML file**, DM Sans font, all CSS and JS inline
- [ ] **Icons** — Untitled UI stroke SVGs, `fill="none"`, `stroke-width="2"`, `stroke-linecap="round"`

---

## Conversion Workflow (screenshot → glassy dashboard)

1. Identify all sections: sidebar nav items, topbar actions, stat metrics, content panels, lists, CTAs
2. Map every element to the component library above
3. Replace all color with token-based equivalents (`var(--border)`, `var(--text-secondary)`, etc.)
4. Preserve all labels, values, and layout structure exactly
5. Add sidebar toggle, theme toggle, and mobile hamburger
6. Output single `.html` file, save to `/mnt/user-data/outputs/`, call `present_files`