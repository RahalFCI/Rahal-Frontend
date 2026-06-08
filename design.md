# Design System: The Solar Minimalist

## 1. Overview & Creative North Star

**Creative North Star: "The Sun-Drenched Archivist"**

This design system transitions from a nocturnal exploration aesthetic to a high-end, editorial experience that feels like a modern museum gallery at high noon. We are moving away from "gamified" tropes (heavy glows, dark UI) toward **Relic Modernism**: a style that treats digital artifacts with the reverence of physical objects.

To break the "template" look, we utilize **Intentional Asymmetry**. Layouts should avoid perfect bilateral symmetry; instead, use oversized typography offsets and overlapping surface containers to create a sense of discovery. This isn't just an app; it's a curated journal of exploration.

---

## 2. Colors & Surface Logic

### The Palette

The core of this system is the interplay between the stark, architectural `surface` and the vibrant, "solar" `primary` amber.

- **Primary (#755700):** A sophisticated, high-contrast amber-gold used for critical actions.
- **Surface (#F5F6F7):** The "canvas." A clean, airy off-white that serves as the base for all exploration.
- **On-Surface (#2C2F30):** A deep, slate charcoal that provides the "Editorial" weight to the Space Grotesk type.

### The "No-Line" Rule

**Explicit Instruction:** Do not use 1px solid borders to section off the UI. Separation of concerns must be achieved through:

1.  **Background Shifts:** Place a `surface-container-low` component against a `surface` background.
2.  **Negative Space:** Use the spacing scale to create "air" between functional groups.
3.  **Tonal Transitions:** Moving from `surface-container-lowest` (pure white) to `surface-container` to define hierarchy.

### Surface Hierarchy & Nesting

Treat the UI as a series of stacked, premium cardstock.

- **Base Layer:** `surface` (#F5F6F7)
- **Sectional Grouping:** `surface-container-low` (#EFF1F2)
- **Interactive Cards:** `surface-container-lowest` (#FFFFFF) — These should "pop" against the slightly darker background.

### The "Glass & Gradient" Rule

To prevent the UI from feeling "flat," use subtle radial gradients on hero elements (transitioning from `primary` to `primary-container`). For floating navigation or modals, employ **Glassmorphism**: use `surface` at 80% opacity with a `20px` backdrop-blur to allow the "sun-drenched" background colors to bleed through softly.

---

## 3. Typography

We use **Space Grotesk** exclusively. Its quirky, geometric terminals bridge the gap between "technical tool" and "modernist art."

- **Display (L/M/S):** Used for "Relic Titles" or milestone achievements. Use tight letter-spacing (-2%) to give it an authoritative, editorial feel.
- **Headline (L/M/S):** The primary storyteller. Use `headline-lg` for page titles, often offset to the left or right to break the grid.
- **Body (LG/MD):** High-readability slate (`on-surface`). Never use pure black (#000) for body text; the slate `on-surface` maintains the "soft-light" aesthetic.
- **Label (MD/SM):** All-caps for metadata, using `on-surface-variant` with increased letter-spacing (+5%) to mimic archival cataloging.

---

## 4. Elevation & Depth

### The Layering Principle

Depth is achieved through **Tonal Layering**. Instead of using shadows to lift an object, use color contrast. A `surface-container-lowest` (White) card sitting on a `surface` (Light Grey) background creates a natural, "physical" lift.

### Ambient Shadows

Shadows are a last resort for "floating" elements (like FABs or Modals).

- **Value:** 0px 10px 40px
- **Color:** `on-surface` at 6% opacity.
- **Note:** The shadow should feel like a soft "glow" of darkness rather than a hard drop shadow.

### The "Ghost Border" Fallback

If a border is required for accessibility on `surface-container-lowest` elements, use the `outline-variant` token at **15% opacity**. This creates a "suggestion" of an edge rather than a hard containment line.

---

## 5. Components

### Buttons

- **Primary:** Solid `primary` background with `on-primary` text. No border. Use `xl` (0.75rem) roundedness for a modern, approachable feel.
- **Secondary:** `primary-container` background. Provides a "soft amber" look for secondary actions.
- **Tertiary:** No background. Bold `primary` text. Use for low-emphasis navigation.

### Cards & Discovery Modules

- **Rule:** Forbid the use of divider lines within cards.
- **Implementation:** Use vertical whitespace and `title-sm` vs `body-sm` typography to separate information. Cards should use `surface-container-lowest` with a `lg` (0.5rem) corner radius.

### Input Fields

- **Style:** Minimalist. No bottom line. Use a `surface-container-high` fill with a `sm` radius. Upon focus, transition the background to `primary-container` at 30% opacity.

### Navigation (The Archivist Bar)

- Instead of a standard bottom nav, use a floating "dock" using **Glassmorphism**. Semi-transparent `surface` with a heavy backdrop-blur allows the app content to scroll behind it, maintaining the "airy" feel.

---

## 6. Do’s and Don’ts

### Do:

- **Do** use asymmetrical margins (e.g., 24px left, 40px right) for headline elements to create an editorial layout.
- **Do** use `primary` amber sparingly as a "beacon"—it should guide the eye to the most important action on the screen.
- **Do** embrace "White Space." If a screen feels crowded, increase the `surface` padding rather than adding lines.

### Don't:

- **Don't** use 1px solid dividers. Use a 4px `surface-container` gap instead.
- **Don't** use heavy black shadows. They destroy the "sun-drenched" modernist aesthetic.
- **Don't** use "Game UI" tropes like heavy glows or skeuomorphic textures. This is a professional exploration tool.
- **Don't** use high-contrast borders (100% opacity `outline`). It traps the content and makes the app feel "boxed in."
