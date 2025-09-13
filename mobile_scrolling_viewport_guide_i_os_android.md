# Mobile Scrolling & Viewport Guide (iOS & Android)

A practical checklist for building web apps that scroll correctly on iOS Safari/Chrome and Android Chrome.

---

## 1) Viewport & Meta

**Always include:**

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

- `viewport-fit=cover` enables safe-area (`env(safe-area-inset-*)`) on iOS.
- Prefer \*\*App Router \*\*\`\` in Next.js 13+.

**Avoid:**

- User-scalable=no (hurts accessibility and can introduce bugs).

---

## 2) Height Units (ditch fragile `100vh`)

| Use          | When                                                            | Notes                                                  |
| ------------ | --------------------------------------------------------------- | ------------------------------------------------------ |
| `100dvh`     | Modern iOS 16+/Android                                          | Dynamic viewport that adjusts with toolbars.           |
| `100svh`     | When you want the **smallest** viewport (with toolbars visible) | Good for fixed UIs that shouldn’t jump when bars hide. |
| `100lvh`     | When you want **largest** viewport (bars hidden)                | Risk of content being hidden initially.                |
| `var(--vvh)` | Universal fallback                                              | Set to `visualViewport.height` at runtime.             |

**Runtime var pattern:**

```js
(function(){
  function setVH(){
    const h = (window.visualViewport?.height) || window.innerHeight;
    document.documentElement.style.setProperty('--vvh', h + 'px');
  }
  setVH();
  window.addEventListener('resize', setVH);
  window.visualViewport?.addEventListener('resize', setVH);
  window.addEventListener('pageshow', e => { if (e.persisted) setVH(); });
})();
```

```css
.min-h-vvh { min-height: var(--vvh); }
```

**Rule of thumb:** Replace mobile `h-screen`/`height:100vh` with `min-height:100dvh` or `min-h-vvh`.

---

## 3) Safe Areas (notches, home indicator)

**Content wrappers:**

```css
.page-safe {
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
  padding-bottom: env(safe-area-inset-bottom);
}
```

**Fixed elements:**

```css
.footer-fixed {
  position: fixed;
  left: 16px; right: 16px;
  bottom: max(12px, calc(env(safe-area-inset-bottom) + 8px));
}
```

Add extra content padding equal to your fixed-footer height so nothing is hidden.

---

## 4) Scroll Containers: pick **one** scroller

- Let the **page** (`html, body`) scroll **OR** a single main wrapper (e.g., `.page-scroll`). Avoid nested full-page scrollers.
- Avoid global `overflow:hidden` on `html, body` unless you’re intentionally locking background scroll for a modal.

**Smooth scrolling for internal containers (iOS needs it):**

```css
.scroll-area {
  overflow: auto;
  -webkit-overflow-scrolling: touch; /* iOS momentum */
}
```

---

## 5) Fixed vs Sticky

- Prefer `position: sticky` headers to avoid iOS fixed-position jitters.
- If you must use `fixed`, make it safe-area aware and add padding to content so it won’t be overlapped.

---

## 6) Prevent layout/scroll jumps on load

- **Hydration:** Don’t render desktop first then swap to mobile. Gate with an `isReady` or render mobile-safe markup by default.
- **Start at top:**

```js
window.addEventListener('load', () => requestAnimationFrame(() => window.scrollTo(0, 0)));
window.addEventListener('pageshow', e => { if (e.persisted) requestAnimationFrame(() => window.scrollTo(0, 0)); });
```

- Avoid `autofocus` inputs on initial route; iOS will scroll to them.

---

## 7) Keyboard & Inputs (iOS quirks)

- The on-screen keyboard changes viewport height. Use the `visualViewport` pattern (above) to resize panels responsibly.
- Don’t rely on `100vh` forms; use `min-height:100dvh` + scrollable inner area.
- To keep CTA visible above keyboard:

```css
.keyboard-aware {
  position: fixed;
  bottom: calc(env(safe-area-inset-bottom) + 8px);
}
```

---

## 8) Modals, Drawers & Background Scroll Lock

**Recommended lock:**

```js
function lockBodyScroll(){
  const scrollY = window.scrollY;
  document.body.dataset.scrollY = String(scrollY);
  document.body.style.position = 'fixed';
  document.body.style.top = `-${scrollY}px`;
  document.body.style.width = '100%';
}
function unlockBodyScroll(){
  const y = Number(document.body.dataset.scrollY || 0);
  document.body.style.position = '';
  document.body.style.top = '';
  window.scrollTo(0, y);
}
```

- Avoid overlay listeners that call `preventDefault()` on the whole page; scope them to the modal only.
- Make modal content scrollable with momentum:

```css
.modal-content{ overflow:auto; -webkit-overflow-scrolling:touch; }
```

---

## 9) Overscroll, Pull-to-Refresh & Edge Gestures

- Control scrolling behavior on nested panes:

```css
/***** Avoid scroll chaining *****/
.container { overscroll-behavior: contain; }
/* or for the whole page */
html, body { overscroll-behavior-y: none; }
```

- Don’t block the browser’s back-swipe from the left edge unless essential.

---

## 10) Scroll Snap (use cautiously)

- iOS can be finicky with `scroll-snap-*`. Start with conservative settings:

```css
.snap-x { scroll-snap-type: x mandatory; }
.snap-center { scroll-snap-align: center; }
.snap-stop { scroll-snap-stop: always; }
```

- Keep snap containers simple; avoid nested snaps and fixed children inside the snap viewport.

---

## 11) Performance & Paint

- Use `contain: content;` on large sections to limit layout scope.
- Promote frequently animating elements: `will-change: transform;` (use sparingly).
- Prefer `transform`/`opacity` animations; avoid animating layout properties (`height`, `top`) during scroll.

---

## 12) Common Anti-Patterns

- `height: 100vh` on mobile full-screen sections.
- Multiple nested full-height scrollers.
- Global `overflow:hidden` on `html, body`.
- Fixed footer with **no** safe-area/extra bottom padding for content.
- Autofocusing inputs on initial render.
- Blocking passive touch events globally (breaks momentum scroll).

---

## 13) Testing Matrix

**Devices:** iPhone with/without notch (13/SE), iPad (split view), modern Android.

**Browsers:** iOS Safari (primary), iOS Chrome (same engine), Android Chrome, Firefox (Android).

**Scenarios:**

- Initial load (portrait/landscape).
- Navigate with back/forward cache.
- Rotate device mid-scroll.
- Open keyboard in forms.
- Open/close modals; ensure background remains locked.
- Toggle browser UI (scroll down/up to hide/show toolbars) and confirm no cut-off.

---

## 14) Quick Copy-Paste Snippets

**Safe content wrapper:**

```css
.page { min-height: 100dvh; padding: 16px; }
@supports (-webkit-touch-callout: none) {
  .page { min-height: -webkit-fill-available; }
}
.page { padding-bottom: calc(env(safe-area-inset-bottom) + var(--footer-h,0px)); }
```

**Fixed footer with notch-awareness:**

```css
.footer { position: fixed; left: 16px; right: 16px;
  bottom: max(12px, calc(env(safe-area-inset-bottom) + 8px)); }
```

**Momentum scroll area:**

```css
.scroll { overflow:auto; -webkit-overflow-scrolling:touch; }
```

**Start-at-top + bfcache:**

```js
addEventListener('load', () => requestAnimationFrame(() => scrollTo(0,0)));
addEventListener('pageshow', e => { if (e.persisted) requestAnimationFrame(() => scrollTo(0,0)); });
```

---

## 15) Android-Specific Notes

- Android Chrome is generally stable with `100vh`, but dynamic toolbars still exist on some devices. Prefer `100dvh` for parity.
- Keyboard handling is less jumpy than iOS but still test forms with absolute/fixed footers.

---

## 16) Debugging Checklist

- ✅ Viewport meta present with `viewport-fit=cover`.
- ✅ No `height:100vh` on full-screen mobile containers.
- ✅ Safe-area padding for content and fixed UI.
- ✅ Exactly one main scroll container.
- ✅ No global `overflow:hidden` (unless intentionally locking).
- ✅ Start-at-top handlers in place.
- ✅ Inputs don’t autofocus on first paint.
- ✅ Modals lock background scroll correctly.
- ✅ VisualViewport handler applied if you use `var(--vvh)`.

---

**Keep this handy** as a project template. If you want, we can turn it into a Tailwind plugin or a small utility package you can drop into new apps.

