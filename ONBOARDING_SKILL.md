# Onboarding Flow Skill

## Overview
This skill implements a multi-step onboarding flow (inspired by Spline's onboarding UX) where:
- Each step is a distinct screen centered on the page
- The URL updates with the step number as the user progresses (e.g. `/onboarding-step1`, `/onboarding-step2`)
- A dot/pill progress indicator at the bottom highlights the current step
- A glowing holographic avatar sits above each step's title
- All steps share the same dark background (`#111113`) and minimal dark-card inputs

---

## Step Structure (4 Steps)

### Step 1 — Name
- **Heading:** `How shall we call you?`
- **Input:** Text field (placeholder: username or name)
- **Extras:** Checkbox — "Subscribe to [App] news and updates."
- **CTA:** `Next` (blue pill button)

### Step 2 — Use Case
- **Heading:** `What will you use [App] for?`
- **Options:** Vertical list of selectable buttons — `Work`, `Hobby / Fun`, `Education` (radio-style, one selectable at a time, highlight border on select)
- **CTA:** `Next`

### Step 3 — Usage Mode
- **Heading:** `How are you planning to use [App]?`
- **Options:** Two side-by-side cards:
  - `By myself` — icon: single person, subtitle: "Your own personal space."
  - `With my team` — icon: two people, subtitle: "A collaborative space."
- **CTA:** `Next`

### Step 4 — Company Info
- **Heading:** `Let's get to meet you.`
- **Subheading:** `Understanding who uses [App] will help us improve.`
- **Inputs:** `Company Name` (text), `Company size` (dropdown)
- **CTA:** `Next` (or `Finish`)

---

## URL Strategy

Use the History API to update the URL without a page reload:

```js
// On advancing to step N:
const step = 2; // current step number
window.history.pushState({ step }, '', `/onboarding-step${step}`);
```

On page load, read the current step from the URL:

```js
function getStepFromURL() {
  const match = window.location.pathname.match(/onboarding-step(\d+)/);
  return match ? parseInt(match[1], 10) : 1;
}
```

Handle browser back/forward navigation:

```js
window.addEventListener('popstate', (e) => {
  const step = e.state?.step ?? getStepFromURL();
  showStep(step);
});
```

---

## Progress Indicator

6 pill-shaped indicators at the bottom (or however many total steps you have).

```html
<div class="progress-dots">
  <span class="dot active"></span>
  <span class="dot"></span>
  <span class="dot"></span>
  <span class="dot"></span>
  <span class="dot"></span>
  <span class="dot"></span>
</div>
```

```css
.progress-dots {
  display: flex;
  gap: 6px;
  justify-content: center;
  margin-top: 28px;
}

.dot {
  width: 28px;
  height: 5px;
  border-radius: 999px;
  background: #2a2a35;
  transition: background 0.3s ease, width 0.3s ease;
}

.dot.active {
  background: #888;
  width: 36px;
}
```

Update dots in JS:

```js
function updateDots(step) {
  document.querySelectorAll('.dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === step - 1);
  });
}
```

---

## Avatar / Logo Orb

Holographic gradient orb above each step heading:

```html
<div class="orb"></div>
```

```css
.orb {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: conic-gradient(
    from 180deg,
    #a78bfa, #60a5fa, #f472b6, #facc15, #34d399, #a78bfa
  );
  margin-bottom: 20px;
  flex-shrink: 0;
}
```

---

## Dark UI Design Tokens

```css
:root {
  --bg:            #111113;
  --card-bg:       #1a1a1f;
  --border:        #2a2a35;
  --border-hover:  #3a3a4a;
  --border-sel:    #3a6ff8;
  --text:          #e8e8ee;
  --muted:         #888;
  --blue:          #3a6ff8;
  --blue-hover:    #4d7eff;
  --input-bg:      #1c1c22;
  --radius:        10px;
}
```

---

## Input / Button Styles

### Text Input
```css
input[type="text"] {
  width: 100%;
  background: var(--input-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 12px 16px;
  color: var(--text);
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}
input[type="text"]:focus {
  border-color: var(--blue);
}
```

### Dropdown
```css
select {
  width: 100%;
  background: var(--input-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 12px 16px;
  color: var(--muted);
  font-size: 14px;
  outline: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
}
```

### Option Button (Step 2 list)
```css
.option-btn {
  width: 100%;
  background: var(--input-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 13px 16px;
  color: var(--text);
  font-size: 14px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}
.option-btn:hover  { border-color: var(--border-hover); }
.option-btn.selected {
  border-color: var(--border-sel);
  background: rgba(58,111,248,0.08);
}
```

### Card Option (Step 3 side-by-side)
```css
.card-option {
  flex: 1;
  background: var(--input-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 40px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}
.card-option:hover    { border-color: var(--border-hover); }
.card-option.selected {
  border-color: var(--border-sel);
  background: rgba(58,111,248,0.08);
}
.card-option .label   { font-size: 14px; color: var(--text); }
.card-option .sub     { font-size: 12px; color: var(--muted); }
```

### Next Button
```css
.btn-next {
  width: 100%;
  background: var(--blue);
  color: #fff;
  border: none;
  border-radius: var(--radius);
  padding: 13px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-next:hover { background: var(--blue-hover); }
```

---

## Step Transition (show/hide)

```js
function showStep(n) {
  document.querySelectorAll('.step').forEach((el, i) => {
    el.style.display = i === n - 1 ? 'flex' : 'none';
  });
  updateDots(n);
  window.history.pushState({ step: n }, '', `/onboarding-step${n}`);
}
```

---

## Full JS Controller Skeleton

```js
let currentStep = getStepFromURL();

document.querySelectorAll('.btn-next').forEach(btn => {
  btn.addEventListener('click', () => {
    const next = currentStep + 1;
    if (next <= TOTAL_STEPS) {
      currentStep = next;
      showStep(currentStep);
    } else {
      // onboarding complete — redirect to app
      window.location.href = '/dashboard';
    }
  });
});

// Option buttons (Step 2)
document.querySelectorAll('.option-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
  });
});

// Card options (Step 3)
document.querySelectorAll('.card-option').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.card-option').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
  });
});

window.addEventListener('popstate', (e) => {
  currentStep = e.state?.step ?? getStepFromURL();
  showStep(currentStep);
});

// Init
showStep(currentStep);
```

---

## HTML Skeleton

```html
<body>
  <div class="wrapper">

    <!-- Step 1 -->
    <div class="step" id="step-1">
      <div class="orb"></div>
      <h2>How shall we call you?</h2>
      <input type="text" placeholder="yourname" />
      <label class="checkbox-row">
        <input type="checkbox" checked /> Subscribe to news and updates.
      </label>
      <button class="btn-next">Next</button>
      <div class="progress-dots"><!-- dots --></div>
    </div>

    <!-- Step 2 -->
    <div class="step" id="step-2">
      <div class="orb"></div>
      <h2>What will you use [App] for?</h2>
      <button class="option-btn">Work</button>
      <button class="option-btn">Hobby / Fun</button>
      <button class="option-btn">Education</button>
      <button class="btn-next">Next</button>
      <div class="progress-dots"><!-- dots --></div>
    </div>

    <!-- Step 3 -->
    <div class="step" id="step-3">
      <div class="orb"></div>
      <h2>How are you planning to use [App]?</h2>
      <div class="cards-row">
        <div class="card-option">
          <!-- person icon -->
          <span class="label">By myself</span>
          <span class="sub">Your own personal space.</span>
        </div>
        <div class="card-option">
          <!-- group icon -->
          <span class="label">With my team</span>
          <span class="sub">A collaborative space.</span>
        </div>
      </div>
      <button class="btn-next">Next</button>
      <div class="progress-dots"><!-- dots --></div>
    </div>

    <!-- Step 4 -->
    <div class="step" id="step-4">
      <div class="orb"></div>
      <h2>Let's get to meet you.</h2>
      <p class="sub-heading">Understanding who uses [App] will help us improve.</p>
      <input type="text" placeholder="Company Name" />
      <select>
        <option value="" disabled selected>Company size</option>
        <option>1–10</option>
        <option>11–50</option>
        <option>51–200</option>
        <option>200+</option>
      </select>
      <button class="btn-next">Next</button>
      <div class="progress-dots"><!-- dots --></div>
    </div>

  </div>
</body>
```

---

## Framework Notes

**Vanilla JS / HTML** — use `history.pushState` as shown above.

**React (React Router)** — use `useNavigate` instead:
```jsx
import { useNavigate } from 'react-router-dom';
const navigate = useNavigate();
// advance step:
navigate(`/onboarding-step${nextStep}`);
```
Define routes: `<Route path="/onboarding-step:step" element={<OnboardingPage />} />`
Read step: `const { step } = useParams();`

**Next.js** — use `router.push`:
```js
import { useRouter } from 'next/router';
const router = useRouter();
router.push(`/onboarding-step${nextStep}`);
```
Create pages: `pages/onboarding-step[step].jsx` with `useRouter().query.step`.

---

## Checklist

- [ ] URL updates on every `Next` click
- [ ] Browser back button returns to previous step
- [ ] Direct URL load (`/onboarding-step3`) starts at the correct step
- [ ] Progress dots sync with current step
- [ ] Option/card selections persist if user goes back
- [ ] Final step redirects to the app
- [ ] All inputs are accessible (labels, keyboard navigation)
