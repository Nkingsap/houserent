# Design System Specification: The Academic Sanctuary

## 1. Overview & Creative North Star
This design system is built on the Creative North Star of **"The Curated Campus."** We are moving away from the cluttered, "classifieds" look of traditional rental platforms toward a high-end editorial experience that feels like a premium lifestyle magazine, yet remains entirely accessible. 

By utilizing **Organic Functionalism**, we break the rigid, boxy grid. We use intentional white space, asymmetrical image placements, and overlapping typography to create a sense of breath and ease. For a student, finding a home is stressful; this system acts as a visual sedative—professional, trustworthy, and sophisticated without being elitist.

## 2. Colors & Surface Philosophy
The palette avoids the "tech-blue" cliché, opting instead for a sophisticated pairing of **Slate Blue (`primary`)** and **Sage Green (`secondary`)**. These tones ground the experience in nature and stability.

### The "No-Line" Rule
**Strict Mandate:** Designers are prohibited from using 1px solid borders to define sections. 
Structure must be created through **Tonal Transitions**. 
- To separate a header from a body, transition from `surface` (#f7fafc) to `surface-container-low` (#eff4f8). 
- To highlight a featured property, place a `surface-container-lowest` (#ffffff) card against a `surface-container` (#e9eff3) background.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of semi-translucent papers.
*   **Base:** `surface` (#f7fafc) – The primary canvas.
*   **Depth Level 1:** `surface-container-low` (#eff4f8) – For subtle secondary content areas.
*   **Depth Level 2:** `surface-container-highest` (#dbe4e9) – For high-priority interactive utility bars.

### The "Glass & Gradient" Rule
To inject "soul" into the functional layout, use **Glassmorphism** for floating navigation and filter bars. 
- Use `surface` at 80% opacity with a `20px` backdrop-blur. 
- **CTAs:** Apply a subtle linear gradient from `primary` (#32657a) to `primary_dim` (#24596e) at a 135-degree angle. This adds a tactile, "clickable" depth that flat hex codes lack.

## 3. Typography: Editorial Authority
We use a dual-font system to balance character with readability.

*   **Display & Headlines (Manrope):** This geometric sans-serif provides a modern, architectural feel. Use `display-lg` (3.5rem) with tighter letter-spacing (-0.02em) for hero headers to create an editorial "masthead" look.
*   **Body & UI (Inter):** The workhorse. Inter is chosen for its high x-height and exceptional legibility at small sizes (`body-sm` 0.75rem).
*   **The Hierarchy Intent:** Large `headline-lg` titles should feel like article headers—authoritative and calm. Use `label-md` in all-caps with 5% letter spacing for "Property Type" tags to create a premium metadata feel.

## 4. Elevation & Depth
In this system, shadows are light and air; they are not structural supports.

*   **Tonal Layering:** 90% of hierarchy should be achieved by stacking `surface-container` tiers. A `surface-container-lowest` card sitting on a `surface-container-low` background creates a "Ghost Lift."
*   **Ambient Shadows:** For floating elements (Modals/FABs), use a multi-layered shadow:
    *   `0px 4px 20px rgba(43, 52, 56, 0.04)` (The Umbra)
    *   `0px 12px 40px rgba(43, 52, 56, 0.08)` (The Penumbra)
*   **The "Ghost Border" Fallback:** If accessibility requires a stroke (e.g., input fields), use `outline-variant` (#abb3b9) at **20% opacity**. Never use a 100% opaque stroke.

## 5. Components & Primitive Styling

### Buttons
- **Primary:** Gradient-filled (`primary` to `primary_dim`), `xl` roundedness (1.5rem), `title-sm` typography. 
- **Secondary:** `surface-container-high` background with `on-surface` text. No border.
- **Interaction:** On hover, the button should scale to 102% and the shadow should increase in blur, not opacity.

### Property Cards
- **Construction:** Use `surface-container-lowest`. 
- **Rule:** **No dividers.** Separate the image, price, and location using the Spacing Scale (specifically `spacing-4` for internal padding and `spacing-2` for text grouping).
- **Image:** Apply `lg` (1rem) rounded corners to the top only, bleeding into the card container.

### Input Fields
- **Default State:** `surface-container-low` background. No border. `md` roundedness (0.75rem).
- **Focus State:** 1px `primary` border with a 4px `primary_container` soft outer glow.
- **Labels:** Always use `label-md` positioned above the field, never inside as placeholder text.

### Chips (Filters)
- Use `secondary_container` (#c6ecc7) for active states to give a "Sage Green" nod to growth and affordability. 
- Unselected chips should be `surface-container-high`.

### Search & Navigation
- **The Floating Search:** Use a `full` roundedness (9999px) search bar with Glassmorphism. It should appear to float over the content, utilizing the Ambient Shadow.

## 6. Do’s and Don'ts

### Do
- **Do** use asymmetrical margins. If the left margin is `spacing-8`, try a right margin of `spacing-12` for editorial layouts.
- **Do** use high-scale typography contrast. Pair a `display-sm` headline with a `body-md` description.
- **Do** embrace white space. If you think there’s enough room, add `spacing-4` more.

### Don't
- **Don't** use 1px dividers. Use a `surface-variant` (#dbe4e9) background block or empty vertical space.
- **Don't** use pure black (#000000). Always use `on-surface` (#2b3438) for text to maintain a soft, premium feel.
- **Don't** use high-gloss or "luxury" effects like gold gradients or marble textures. Reliability comes from clarity, not flash.
- **Don't** use sharp 90-degree corners. Everything must feel approachable via the Roundedness Scale (minimum `sm` for small UI, `xl` for large containers).