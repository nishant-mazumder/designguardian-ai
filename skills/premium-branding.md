# Premium Branding & Visual DNA Design Governance

This document defines premium branding aesthetics, border radius scales, box shadows, gradients, micro-interactions, and visual polish rules. These guidelines prevent Dribbble gimmicks, glassmorphism abuse, and unrefined interactive physics.

## Rules

### Rule: BORDER-001 - Standard Border Radius Scale
- **ID**: BORDER-001
- **Severity**: error
- **Description**: UI card, button, and container corners must use standard border radius values. Custom values are prohibited.
- **Rationale**: A standardized border radius scale harmonizes layout shapes across different components.
- **Allowed Values**: 0px, 2px, 4px, 6px, 8px, 12px, 16px, 24px, 9999px (rounded-none, rounded-sm, rounded-md, rounded-lg, rounded-xl, rounded-2xl, rounded-full).
- **Anti-Pattern**: Setting random corners like `border-radius: 13px` or `rounded-[30px]`.
- **Preferred Pattern**: Buttons styled with `rounded-lg` (8px), cards with `rounded-xl` (12px) or `rounded-2xl` (16px).
- **Refactoring Guidance**: Adjust custom border-radius properties to the nearest approved theme variables.

### Rule: BORDER-002 - Concentric Radius Nesting Math
- **ID**: BORDER-002
- **Severity**: error
- **Description**: Outer border radius values must be larger than nested inner container radii, following concentric corner geometry.
- **Rationale**: When inner corners match outer corners exactly, the margin space looks pinched and distorted.
- **Allowed Values**: Outer Radius = Inner Radius + Padding (or close approximation).
- **Anti-Pattern**: Nesting a card with `rounded-xl` inside a container that also uses `rounded-xl`.
- **Preferred Pattern**: Outer container `rounded-xl` (12px) with `p-2` (8px) padding, wrapping an inner element with `rounded-md` (6px).
- **Refactoring Guidance**: Scale down nested child corner radii to maintain clean concentric paths.

### Rule: BORDER-003 - Subtle Dual Border Accents
- **ID**: BORDER-003
- **Severity**: info
- **Description**: High-end containers can use a double border effect: a subtle solid outer border paired with a top highlight border.
- **Rationale**: Simulates physical product textures (Apple design language), making panels feel tactile and premium.
- **Allowed Values**: Multi-border styles.
- **Anti-Pattern**: Raw thick borders with no depth highlights.
- **Preferred Pattern**: Card styled with `border border-neutral-200 dark:border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]`.
- **Refactoring Guidance**: Add a subtle inset shadow to simulate top highlight lines on dark mode cards.

### Rule: SHADOW-001 - Approved Box Shadows Scale
- **ID**: SHADOW-001
- **Severity**: error
- **Description**: Avoid using arbitrary box-shadow values. Select from the design system's approved elevation shadow tokens.
- **Rationale**: Standardized elevations ensure consistent depth and lighting physics across components.
- **Allowed Values**: shadow-sm, shadow-md, shadow-lg (using light, high-transparency dark gray fills).
- **Anti-Pattern**: Card containers using heavy, dark `shadow-2xl` or colored glow shadows.
- **Preferred Pattern**: Flat panels using `shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]`.
- **Refactoring Guidance**: Remove custom box-shadow styles and replace them with standard utility classes.

### Rule: SHADOW-002 - Ambient Occlusion Layering
- **ID**: SHADOW-002
- **Severity**: warning
- **Description**: Large floating components (modals, popovers) must use layered box shadows: a soft, wide ambient shadow paired with a sharp, tight outline shadow.
- **Rationale**: Simulates realistic lighting, preventing floating components from looking flat or detached from pages.
- **Allowed Values**: Layered CSS shadows.
- **Anti-Pattern**: Using single-layer box shadows that look like thick dark outlines on pages.
- **Preferred Pattern**: Modal shadow: `shadow-[0_12px_30px_-10px_rgba(0,0,0,0.1),_0_2px_8px_-3px_rgba(0,0,0,0.05)]`.
- **Refactoring Guidance**: Reconfigure overlay box shadows to use a two-layer ambient setup.

### Rule: GRAD-001 - Muted Gradient Angles and Colors
- **ID**: GRAD-001
- **Severity**: warning
- **Description**: Linear gradients must be subtle, using a 10 to 15-degree angle range and colors with closely matched hues.
- **Rationale**: Harsh, high-contrast diagonal gradients look cheap and distract from text descriptions.
- **Allowed Values**: Close-hued gradients (e.g. zinc-900 to zinc-950, or indigo-500 to violet-600).
- **Anti-Pattern**: Using rainbow gradients (`from-red-500 via-yellow-500 to-blue-500`) across background sections.
- **Preferred Pattern**: Section background: `bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-950`.
- **Refactoring Guidance**: Reduce gradient color differences and change angles to vertical or horizontal planes.

### Rule: GRAD-002 - Text Gradient Contrast Compliance
- **ID**: GRAD-002
- **Severity**: error
- **Description**: Gradient text fills must maintain contrast compliance (WCAG AA) along the entire span of the text.
- **Rationale**: Dark gradient steps can blend into dark page backgrounds, rendering segments of headers unreadable.
- **Allowed Values**: Contrast compliance >= 4.5:1 across the gradient range.
- **Anti-Pattern**: Heading text fading from bright white to dark grey on a black background.
- **Preferred Pattern**: Text gradient: `bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent`.
- **Refactoring Guidance**: Adjust gradient color stops to ensure the entire text block remains highly legible.

### Rule: BRAND-001 - Micro-Interaction Transition Easing
- **ID**: BRAND-001
- **Severity**: warning
- **Description**: Interactive animations (hover transitions, menu openings) must use custom ease-out or ease-in-out bezier curves. Linear animations are prohibited.
- **Rationale**: Natural easing curves match physical motion, making transitions feel responsive and smooth.
- **Allowed Values**: Out-quint: `cubic-bezier(0.16, 1, 0.3, 1)` or Out-quad: `cubic-bezier(0.4, 0, 0.2, 1)`.
- **Anti-Pattern**: Using `transition-all duration-300 linear` or instant snap transitions on hover.
- **Preferred Pattern**: Button transition: `transition-all duration-200 cubic-bezier(0.16, 1, 0.3, 1)`.
- **Refactoring Guidance**: Replace linear transition timings with standard ease-out curves.

### Rule: BRAND-002 - Button Active Click Scaling
- **ID**: BRAND-002
- **Severity**: info
- **Description**: Primary buttons should scale down slightly (to 98%) when clicked, providing physical haptic feedback.
- **Rationale**: Improves the tactile feel of digital buttons (Framer and Apple interactive detail).
- **Allowed Values**: Scale transformations (e.g. `active:scale-[0.98]`).
- **Anti-Pattern**: Static buttons with zero dimensional feedback on click.
- **Preferred Pattern**: Button: `transition-transform duration-100 active:scale-[0.98]`.
- **Refactoring Guidance**: Add active scale transitions to primary action buttons.

### Rule: BRAND-003 - Minimalist Loading Spinner Styles
- **ID**: BRAND-003
- **Severity**: warning
- **Description**: Avoid bulky custom loading GIFs or animated characters. Use thin, single-line CSS ring spinners instead.
- **Rationale**: Keeps loading states clean and consistent with a premium product aesthetic.
- **Allowed Values**: Muted single-color spinners.
- **Anti-Pattern**: Bulky custom loading bars or multi-colored spin animations.
- **Preferred Pattern**: Spinner: `w-5 h-5 border-2 border-neutral-300 border-t-neutral-800 rounded-full animate-spin`.
- **Refactoring Guidance**: Replace custom loading animations with clean CSS spinners.

### Rule: BRAND-004 - Modal Entry Animations
- **ID**: BRAND-004
- **Severity**: warning
- **Description**: Modal dialogs must slide up subtly (10px to 20px) or scale up from 95% on enter. Large slide-ins from screen edges are prohibited.
- **Rationale**: Keeps modal transitions clean, elegant, and focused.
- **Allowed Values**: Slide-up or scale-up transitions.
- **Anti-Pattern**: Sliding fullscreen modals from the right margin for simple form popups.
- **Preferred Pattern**: Modal overlay styled with `transition-opacity duration-300` and dialog container using `scale-95 animate-in fade-in zoom-in-95`.
- **Refactoring Guidance**: Set modal entry animations to subtle scale or slide transformations.

### Rule: BRAND-005 - Command Menu Backdrop Blurs
- **ID**: BRAND-005
- **Severity**: error
- **Description**: Command palettes and modal backdrops must feature a subtle backdrop blur combined with a translucent dark overlay.
- **Rationale**: Creates depth separation, focusing attention on the active dialog while keeping background context visible.
- **Allowed Values**: `backdrop-blur-sm` (4px) or `backdrop-blur-md` (8px).
- **Anti-Pattern**: Solid dark grey backdrop masks with zero transparency or blur filters.
- **Preferred Pattern**: Backdrop overlay styled with `bg-neutral-950/40 backdrop-blur-sm`.
- **Refactoring Guidance**: Append `backdrop-blur-sm` to modal backdrop styles.

### Rule: BRAND-006 - Icon Visual Style Consistency
- **ID**: BRAND-006
- **Severity**: error
- **Description**: Do not mix outline and solid icon styles within the same component or navigation menu.
- **Rationale**: Mixing icon styles looks unpolished and breaks the visual harmony of the interface.
- **Allowed Values**: Single visual style (outline-only or solid-only).
- **Anti-Pattern**: Nav bar showing a solid Home icon next to an outlined Settings icon.
- **Preferred Pattern**: Menu using outlined Lucide icons consistently.
- **Refactoring Guidance**: Standardize icon libraries to use a single visual style throughout the interface.

### Rule: BRAND-007 - Dropdown Chevrons standard
- **ID**: BRAND-007
- **Severity**: warning
- **Description**: Option dropdown indicators must use thin micro-chevrons. Large block arrows are prohibited.
- **Rationale**: Minimalist indicators keep the focus on option text and avoid visual clutter.
- **Allowed Values**: Thin chevron icons (e.g., Lucide ChevronDown, thickness 1.5px to 2px).
- **Anti-Pattern**: Using thick arrow symbols or solid triangles next to dropdown items.
- **Preferred Pattern**: Menu trigger containing `<ChevronDown class="w-4 h-4 stroke-[1.5]" />`.
- **Refactoring Guidance**: Replace bulky arrows with thin, stroke-adjustable chevron icons.

### Rule: BRAND-008 - Card Hover Border Transitions
- **ID**: BRAND-008
- **Severity**: warning
- **Description**: Interactive cards must use smooth transitions when highlighting borders on hover.
- **Rationale**: Instant hover border changes look jarring. A smooth fade feels refined and premium.
- **Allowed Values**: Border transition durations between 150ms and 250ms.
- **Anti-Pattern**: Sudden border color changes on card hover.
- **Preferred Pattern**: Card: `border border-neutral-100 transition-colors duration-200 hover:border-neutral-200`.
- **Refactoring Guidance**: Add transition classes to card hover styling declarations.

### Rule: BRAND-009 - Dark Mode Card Elevations
- **ID**: BRAND-009
- **Severity**: error
- **Description**: In dark mode, nested cards must use slightly lighter backgrounds than page backdrops to simulate elevation.
- **Rationale**: Follows standard dark mode depth conventions (lighter equals closer).
- **Allowed Values**: Page backdrop: zinc-950/900; Cards: zinc-900/800.
- **Anti-Pattern**: Using identical pitch-black backdrops for both pages and foreground card panels.
- **Preferred Pattern**: Page: `bg-neutral-950` containing card items with `bg-neutral-900 border border-neutral-800`.
- **Refactoring Guidance**: Step up background color variables for dark mode card layouts.

### Rule: BRAND-010 - Tab Active Indicator Styles
- **ID**: BRAND-010
- **Severity**: warning
- **Description**: Active tab states must be marked with a thin 2px bottom line or a sliding pill background.
- **Rationale**: Keeps tab selections clear and visually aligned with minimalist design systems.
- **Allowed Values**: 2px bottom borders or sliding pill containers.
- **Anti-Pattern**: Highlighting active tabs with heavy colored blocks or oversized borders.
- **Preferred Pattern**: Active tab: `border-b-2 border-blue-600 text-neutral-900`.
- **Refactoring Guidance**: Reset tab indicator styling to thin borders or sliding pills.

### Rule: BRAND-011 - Status Pulse Animations
- **ID**: BRAND-011
- **Severity**: info
- **Description**: Active status indicators (e.g. "Live" dots) should feature a subtle pulse animation.
- **Rationale**: Visually communicates active status without requiring distracting alerts.
- **Allowed Values**: Subtle, slow-pulsing animations.
- **Anti-Pattern**: Static colored dots or fast-flashing indicator circles.
- **Preferred Pattern**: Status green dot with an overlapping pulse circle styled with `animate-ping`.
- **Refactoring Guidance**: Add a secondary ping-animated indicator dot to status controls.

### Rule: BRAND-012 - Eyebrow Category Labels
- **ID**: BRAND-012
- **Severity**: info
- **Description**: Eyebrow category labels must be styled with small text sizes, uppercase transformations, and tracking-widest classes.
- **Rationale**: Separates categories from headings clearly without adding layout weight.
- **Allowed Values**: text-xs, uppercase, tracking-widest.
- **Anti-Pattern**: Eyebrows styled in normal large text sizes.
- **Preferred Pattern**: `<span class="text-xs font-semibold uppercase tracking-widest text-primary-500">Analytics</span>`.
- **Refactoring Guidance**: Adjust eyebrow styling variables to `text-xs uppercase tracking-widest`.

### Rule: BRAND-013 - Quiet UI Design Philosophy
- **ID**: BRAND-013
- **Severity**: warning
- **Description**: Interfaces must prioritize whitespace and clarity, limiting decorative accents to ensure a calm layout.
- **Rationale**: Muted layouts reduce cognitive load and draw focus to primary call-to-actions.
- **Allowed Values**: High whitespace ratios.
- **Anti-Pattern**: Jamming screens with dense sidebars, heavy borders, and excessive decorative items.
- **Preferred Pattern**: Standard dashboard layouts focusing on key charts, surrounded by breathing space.
- **Refactoring Guidance**: Remove non-essential decorative blocks and increase general padding sizes.

### Rule: BRAND-014 - Brand Logo Sizing
- **ID**: BRAND-014
- **Severity**: error
- **Description**: Brand logo symbols must be small and crisp, never exceeding a height of 28px in navigation bars.
- **Rationale**: Oversized logos look unpolished and reduce available header layout space.
- **Allowed Values**: Max height: 28px.
- **Anti-Pattern**: Header bars showing giant brand logos stretching to page bounds.
- **Preferred Pattern**: Logo element styled with `h-6 w-auto` (24px).
- **Refactoring Guidance**: Scale down brand logo height properties in navigation components.

### Rule: BRAND-015 - Toast Animation Entries
- **ID**: BRAND-015
- **Severity**: warning
- **Description**: Toast notifications must slide in from the screen edge with a spring-like ease-out curve.
- **Rationale**: Natural entry physics feel refined and premium.
- **Allowed Values**: Spring-like transitions.
- **Anti-Pattern**: Toast cards snapping instantly onto the screen or sliding across the viewport with linear animations.
- **Preferred Pattern**: Toast styled with `animate-in slide-in-from-bottom-5 duration-300`.
- **Refactoring Guidance**: Apply standard ease-out transitions to toast components.

### Rule: BRAND-016 - Thin Border Lines
- **ID**: BRAND-016
- **Severity**: warning
- **Description**: Page layout dividers and borders must not exceed a thickness of 1px.
- **Rationale**: Thin lines look precise and elegant; thick lines split pages layout blocks awkwardly.
- **Allowed Values**: Max thickness: 1px.
- **Anti-Pattern**: Using `border-2` or `border-4` classes for standard panel borders.
- **Preferred Pattern**: Panel border: `border border-neutral-100 dark:border-neutral-800`.
- **Refactoring Guidance**: Standardize border classes to `border` (1px) and remove heavier border properties.

### Rule: BRAND-017 - Interactive Hover Scale Effects
- **ID**: BRAND-017
- **Severity**: info
- **Description**: Interactive cards can scale up slightly (to 101%) on hover, providing tactile dimensionality.
- **Rationale**: Interactive cards feel responsive to user actions when they react physically on hover.
- **Allowed Values**: Scale transformations (e.g. `hover:scale-[1.01]`).
- **Anti-Pattern**: Heavy, sudden card scaling that shifts adjacent layouts.
- **Preferred Pattern**: Card: `transition-transform duration-200 hover:scale-[1.01]`.
- **Refactoring Guidance**: Add hover scale properties to interactive card selectors.

### Rule: BRAND-018 - Minimalist Table Headers
- **ID**: BRAND-018
- **Severity**: warning
- **Description**: Table headers must be styled with small sizes, uppercase transformations, and tracking-wider classes.
- **Rationale**: Keeps table headers subtle, highlighting table cell values.
- **Allowed Values**: text-xs, uppercase, tracking-wider.
- **Anti-Pattern**: Table headers using bold body-sized text.
- **Preferred Pattern**: Table header styled with `text-xs font-semibold uppercase tracking-wider text-neutral-400`.
- **Refactoring Guidance**: Reset table header text size to `text-xs` and apply tracking modifiers.

### Rule: BRAND-019 - Image Masking Fades
- **ID**: BRAND-019
- **Severity**: warning
- **Description**: Background hero images must fade out using translucent gradients to blend with page contents.
- **Rationale**: Prevents harsh borders between images and page backdrops.
- **Allowed Values**: Mask gradients.
- **Anti-Pattern**: Background images stopping abruptly at a hard border.
- **Preferred Pattern**: Hero section image covered with a vertical fade mask.
- **Refactoring Guidance**: Apply a mask image or linear gradient layer over background hero graphics.

### Rule: BRAND-020 - Subtle Card Hover Shadow shifts
- **ID**: BRAND-020
- **Severity**: warning
- **Description**: Cards must transition their box shadow smoothly on hover to indicate interactivity.
- **Rationale**: Immediate shadow changes look jarring. Smooth transitions feel refined.
- **Allowed Values**: Transition duration: 150ms to 250ms.
- **Anti-Pattern**: Sudden shadow snaps on card hover.
- **Preferred Pattern**: Card: `shadow-sm transition-shadow duration-200 hover:shadow-md`.
- **Refactoring Guidance**: Add transition classes to card shadow declarations.

### Rule: BRAND-021 - Stat Indicator Layouts
- **ID**: BRAND-021
- **Severity**: info
- **Description**: Stat card widgets must be structured with labels on top and metrics underneath.
- **Rationale**: Matches standard dashboard design paradigms (Linear, Stripe).
- **Allowed Values**: Top-to-bottom layout hierarchy.
- **Anti-Pattern**: Stat cards with metric values at the top and labels underneath.
- **Preferred Pattern**: Stat: label text followed by metric numbers.
- **Refactoring Guidance**: Restructure stat panel nodes to place labels above numbers.

### Rule: BRAND-022 - Accent Dot Status Colors
- **ID**: BRAND-022
- **Severity**: error
- **Description**: Status indicator dots must map to standard semantic colors. Custom colors are prohibited.
- **Rationale**: Using random colors for statuses confuses users.
- **Allowed Values**: Green: active/live; Red: error/offline; Yellow: warning/paused; Grey: inactive/draft.
- **Anti-Pattern**: Using blue indicator dots for active systems.
- **Preferred Pattern**: Active dot: `bg-emerald-500`.
- **Refactoring Guidance**: Reset status indicator dot colors to standard semantic tokens.

### Rule: BRAND-023 - Text Selection Color customization
- **ID**: BRAND-023
- **Severity**: info
- **Description**: Custom text selection colors must match brand theme colors.
- **Rationale**: Custom selection overrides fit visual systems better than browser default colors.
- **Allowed Values**: selection:bg-brand/N opacity settings.
- **Anti-Pattern**: Leaving default bright blue selection highlights on monochromatic interfaces.
- **Preferred Pattern**: Global class `selection:bg-blue-500/30 selection:text-white`.
- **Refactoring Guidance**: Configure custom text selection highlights in the root css setup.

### Rule: BRAND-024 - Dynamic Form Input Sizing
- **ID**: BRAND-024
- **Severity**: error
- **Description**: Form inputs must use a minimum text size of 16px to prevent iOS Safari auto-zooming.
- **Rationale**: iOS Safari forces page zooming on inputs smaller than 16px, breaking mobile layouts.
- **Allowed Values**: min 16px.
- **Anti-Pattern**: Compact input text styled with `text-xs` (12px) on mobile viewports.
- **Preferred Pattern**: Input: `text-base md:text-sm`.
- **Refactoring Guidance**: Set input text sizes to at least `text-base` (16px) on mobile viewports.

### Rule: BRAND-025 - Custom Toggle Switches
- **ID**: BRAND-025
- **Severity**: error
- **Description**: Toggle switches must animate smoothly, using transition classes. Direct state snaps are prohibited.
- **Rationale**: Instant toggling looks raw. Smooth transitions feel refined.
- **Allowed Values**: Transition duration: 150ms to 250ms.
- **Anti-Pattern**: Toggle switches snapping instantly from left to right.
- **Preferred Pattern**: Toggle thumb with class `transition-transform duration-200 ease-in-out`.
- **Refactoring Guidance**: Add transition classes to toggle switch thumb selectors.

### Rule: BRAND-026 - Keyboard shortcut badges
- **ID**: BRAND-026
- **Severity**: info
- **Description**: Keyboard shortcut badges (kbd) must use monospace text, small sizes, and subtle borders.
- **Rationale**: Matches standard developer interface layouts (Linear, Vercel).
- **Allowed Values**: font-mono, text-xs, border.
- **Anti-Pattern**: Shortcuts styled with default body fonts.
- **Preferred Pattern**: Key cap: `<kbd class="font-mono text-xs border border-zinc-200 rounded px-1.5 py-0.5">⌘K</kbd>`.
- **Refactoring Guidance**: Reformat keyboard shortcut badges to include monospace styles and borders.

### Rule: BRAND-027 - Page transition fades
- **ID**: BRAND-027
- **Severity**: warning
- **Description**: Page templates must fade in smoothly on load.
- **Rationale**: Soft page loads feel smoother than raw page snaps.
- **Allowed Values**: Transition duration: 150ms to 300ms.
- **Anti-Pattern**: Jarring layout shifts on page load.
- **Preferred Pattern**: Page wrapper with class `animate-fade-in duration-200`.
- **Refactoring Guidance**: Add fade-in classes to root page wrapper elements.

### Rule: BRAND-028 - SVG stroke weights
- **ID**: BRAND-028
- **Severity**: warning
- **Description**: Icons must use thin stroke weights (1.5px to 2px). Heavy strokes are prohibited.
- **Rationale**: Thin strokes match modern, minimalist design aesthetics.
- **Allowed Values**: stroke-[1.5] or stroke-[2].
- **Anti-Pattern**: Icons styled with thick `stroke-[3]` or `stroke-[4]` settings.
- **Preferred Pattern**: Icon with class `stroke-[1.5]`.
- **Refactoring Guidance**: Reset icon stroke parameters to `stroke-[1.5]` or `stroke-[2]`.

### Rule: BRAND-029 - Interactive Button Alignments
- **ID**: BRAND-029
- **Severity**: error
- **Description**: Button labels and icons must align perfectly on the sub-pixel grid.
- **Rationale**: Poor alignment breaks visual harmony.
- **Allowed Values**: Flex layout centering.
- **Anti-Pattern**: Buttons with labels and icons misaligned vertically.
- **Preferred Pattern**: Button: `flex items-center justify-center gap-2`.
- **Refactoring Guidance**: Center button contents using flex properties.

### Rule: BRAND-030 - Badge pill shapes
- **ID**: BRAND-030
- **Severity**: warning
- **Description**: Badge components must use fully rounded borders (`rounded-full`).
- **Rationale**: Pill shapes keep small status badges distinct from interactive buttons.
- **Allowed Values**: `rounded-full`.
- **Anti-Pattern**: Squared status badges styled with `rounded-sm` or `rounded-md`.
- **Preferred Pattern**: Badge with class `rounded-full px-2 py-0.5`.
- **Refactoring Guidance**: Change badge border-radius styles to fully rounded pill shapes.
