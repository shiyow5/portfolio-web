# Design System Document

## 1. Overview & Creative North Star
### Creative North Star: "The 16-Bit Atélier"
This design system moves beyond basic retro-gaming nostalgia to create a "16-Bit Atélier"—a sophisticated, editorial-grade portfolio experience that blends the tactile charm of a life-sim RPG (like Stardew Valley or Animal Crossing) with the spatial precision of a modern high-end digital gallery. 

The system rejects the "flat" web. Instead, it treats the screen as a series of curated, isometric "rooms" and tactile surfaces. We achieve a premium feel by breaking the rigid 12-column grid in favor of **Intentional Asymmetry** and **Tonal Layering**. Elements should feel like they were hand-placed on a mahogany desk, using overlapping "pixel-perfect" containers to create a sense of depth and discovery.

---

## 2. Colors
Our palette is rooted in organic, cozy tones—warm woods, lush greens, and serene sky blues—balanced against a high-end cream paper background.

- **Primary & Secondary (The Environment):** `primary (#005bc3)` and `secondary (#006f1c)` act as the sky and foliage of the UI. Use these for high-action focal points and success states.
- **Tertiary (The Wood Tones):** `tertiary (#7e572e)` and its containers are essential for grounding the UI. These should be used for structural elements like navigation sidebars or "desk-like" containers to evoke a sense of home and craftsmanship.
- **The "No-Line" Rule:** 1px solid borders are strictly prohibited for sectioning. Boundaries must be defined by shifting from `surface` (#fbf9f4) to `surface-container-low` (#f5f4ee) or `surface-container-high` (#e9e8e1).
- **Surface Hierarchy:** Create depth by nesting. A `surface-container-lowest` (#ffffff) card should sit atop a `surface-container-low` section. This mimics the "stacked paper" look found in high-end editorial layouts.
- **Signature Textures:** Use a subtle gradient transition from `primary` to `primary_container` on main CTAs to provide a "lit" effect, making the button feel like a physical, glowing gem in an inventory slot.

---

## 3. Typography
The typography system is a juxtaposition of technical pixel precision and modern clarity.

- **Display & Headlines:** Though the system references `spaceGrotesk`, it must be implemented with **zero anti-aliasing** where possible, or paired with a pixel-font fallback for specific UI labels to maintain the 8-bit aesthetic. Use `display-lg` (3.5rem) for hero statements to create a dramatic, editorial impact.
- **Body & Labels:** High-readability is maintained using `body-md` (0.875rem). The contrast between the quirky, retro-styled headlines and the clean, Grotesk body text signals that this is a professional portfolio, not just a game.
- **Hierarchy as Identity:** Use `label-md` in all-caps with increased letter-spacing for "item tags" (e.g., [PROJECT TYPE]), mimicking the item descriptions in a retro RPG menu.

---

## 4. Elevation & Depth
In this design system, "Elevation" is a physical concept. We do not use standard shadows; we use **Tonal Stacking**.

- **The Layering Principle:** Depth is achieved by stacking `surface-container` tiers. 
    *   *Floor:* `surface`
    *   *Rug/Area:* `surface-container-low`
    *   *Object/Card:* `surface-container-highest`
- **Ambient Shadows:** For floating elements (like character chibi pop-ups), use a large, ultra-soft shadow (8% opacity) tinted with `on_surface` (#31332e). This prevents the UI from looking "dirty" and instead feels like soft ambient light hitting a 3D object.
- **The "Ghost Border":** If a container requires definition against a similar background, use the `outline_variant` at 15% opacity. It must be thick (2px - 4px) to mimic a "pixel stroke" without the harshness of a solid black line.
- **Pixelated Glassmorphism:** For "Inventory" overlays or "Dialog" boxes, use `surface_container_lowest` at 80% opacity with a `backdrop-blur(10px)`. This creates a frosted-glass effect that feels modern yet fits the cozy, layered aesthetic of the reference image.

---

## 5. Components

### Buttons (Action Orbs)
- **Primary:** Background `primary`, text `on_primary`. Use a 4px "bottom-heavy" border of `primary_dim` to create a 3D "pressed" effect.
- **Secondary:** Background `secondary_container`, text `on_secondary_container`. 
- **Interaction:** On hover, the button should shift up 2px, and the shadow (tonal layer) should expand, mimicking a physical spring-loaded button.

### Cards (The Gallery Item)
- **Visuals:** Forbid divider lines. Separate the "Image" area from the "Description" area using a color shift from `surface_container_highest` to `surface_container_low`.
- **Borders:** All cards must use `DEFAULT` roundedness (0px). Apply a 3px solid border using `outline_variant` to emphasize the 16-bit "thick stroke" style.

### Dialogue Boxes (The Interactive Core)
- Use `tertiary_container` for the background and a thick 4px `tertiary` border. 
- Character chibi assets should "break the container" by overlapping the top-left corner of the dialogue box, creating a sense of life and movement.

### Input Fields
- Background: `surface_container_lowest`. 
- Border: 2px `outline`. On focus, the border thickness doubles to 4px and changes to `primary`, simulating a "selected" slot in a game menu.

---

## 6. Do's and Don'ts

### Do:
- **Embrace Asymmetry:** Place your character assets (chibis) slightly off-center or overlapping text blocks to break the "web template" feel.
- **Use Vertical Space:** Use generous padding from the Spacing Scale between sections instead of horizontal rules.
- **Pixel-Align Icons:** Ensure all icons and character assets are aligned to a strict pixel grid to prevent "shimmering" or blurriness.

### Don'ts:
- **No Border-Radius:** Never use rounded corners. The 0px rule is absolute to maintain the 8-bit/16-bit integrity.
- **No Pure Black Shadows:** Never use `#000000` for shadows. Use tinted versions of the surface color to keep the "cozy" vibe.
- **No Thin Lines:** Avoid 1px widths. Everything in a 16-bit world has weight; aim for 2px, 3px, or 4px strokes.
- **Don't Overcrowd:** While the reference image shows cluttered "rooms," the UI should use white space (via `surface`) to let the "furniture" (content) breathe.

---

## 7. Director's Final Note
This system is about **Tactile Nostalgia**. Every click should feel like a button press on a vintage console, and every layout should feel like a carefully composed room in a life-sim game. Use the warm wood tones (`tertiary`) to anchor the experience, making the user feel like they are visiting a handcrafted digital workshop.