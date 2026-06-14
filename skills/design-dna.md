# Design DNA Profile Governance

This document defines the core visual DNA profile rules for DesignGuardian AI. These guidelines consolidate Apple, Stripe, Linear, Vercel, Notion, and Framer aesthetics into actionable development rules to guarantee high-end, calm, minimalist digital products.

## Rules

### Rule: DNA-001 - Minimalist Visual Rhythm
- **ID**: DNA-001
- **Severity**: error
- **Description**: Interfaces must prioritize breathing whitespace over layout density, limiting active components.
- **Rationale**: Generous padding reduces visual load and focuses attention on primary user options.
- **Allowed Values**: Strict whitespace ratios.
- **Anti-Pattern**: Crowded panels with tight paddings and heavy visual clutter.
- **Preferred Pattern**: Dashboard layout relying on clean whitespace and standard margins.
- **Refactoring Guidance**: Remove non-essential decorative blocks and increase container paddings.

### Rule: DNA-002 - Strict Typographic Scales
- **ID**: DNA-002
- **Severity**: error
- **Description**: Typography must follow the approved design system scale, using Inter or default system font families.
- **Rationale**: Inconsistent font sizes break visual hierarchy and look unpolished.
- **Allowed Values**: 11px, 12px, 14px, 16px, 18px, 20px, 24px, 30px, 36px, 48px, 60px.
- **Anti-Pattern**: Using custom sizes like `font-size: 15px` or generic serif fonts.
- **Preferred Pattern**: Text styled with `text-sm` (14px) and headings with `text-2xl` (24px).
- **Refactoring Guidance**: Adjust custom text sizes to the nearest approved scale tokens.

### Rule: DNA-003 - Slate-Zinc Color Foundation
- **ID**: DNA-003
- **Severity**: error
- **Description**: Dark mode layouts must use zinc or slate grays consistently. Do not mix slate and zinc tones.
- **Rationale**: Consistent color undertones create a unified, premium look.
- **Allowed Values**: Zinc family or Slate family.
- **Anti-Pattern**: Using `bg-slate-900` for page backdrops and `bg-zinc-800` for card elements.
- **Preferred Pattern**: Consistently use zinc shades (`bg-zinc-950` with `bg-zinc-900` cards).
- **Refactoring Guidance**: Convert all dark mode gray classes to a single color family.

### Rule: DNA-004 - Subtle Double Borders
- **ID**: DNA-004
- **Severity**: info
- **Description**: High-end containers can use a double border effect: a subtle solid outer border paired with a top highlight border.
- **Rationale**: Simulates physical product textures, making components feel tactile and premium.
- **Allowed Values**: Multi-border styles.
- **Anti-Pattern**: Raw thick borders with no depth highlights.
- **Preferred Pattern**: Card styled with `border border-neutral-200 dark:border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]`.
- **Refactoring Guidance**: Add a subtle inset shadow to simulate top highlight lines on dark mode cards.

### Rule: DNA-005 - Ambient Depth Shadows
- **ID**: DNA-005
- **Severity**: warning
- **Description**: Floating elements must use layered box shadows: a wide ambient shadow paired with a tight outline shadow.
- **Rationale**: Simulates realistic depth, preventing floating components from looking flat.
- **Allowed Values**: Layered CSS shadows.
- **Anti-Pattern**: Using single-layer box shadows that look like thick dark outlines.
- **Preferred Pattern**: Modal shadow: `shadow-[0_12px_30px_-10px_rgba(0,0,0,0.1),_0_2px_8px_-3px_rgba(0,0,0,0.05)]`.
- **Refactoring Guidance**: Reconfigure overlay box shadows to use a two-layer ambient setup.

### Rule: DNA-006 - Linear Transition Bezier Curves
- **ID**: DNA-006
- **Severity**: warning
- **Description**: Interactive animations must use custom ease-out or ease-in-out bezier curves. Linear transitions are prohibited.
- **Rationale**: Eased transitions match physical motion, making UI animations feel natural.
- **Allowed Values**: Out-quint: `cubic-bezier(0.16, 1, 0.3, 1)` or Out-quad: `cubic-bezier(0.4, 0, 0.2, 1)`.
- **Anti-Pattern**: Using `transition-all duration-300 linear` or instant snap transitions on hover.
- **Preferred Pattern**: Button transition: `transition-all duration-200 cubic-bezier(0.16, 1, 0.3, 1)`.
- **Refactoring Guidance**: Replace linear transition timings with standard ease-out curves.

### Rule: DNA-007 - Tactile Button Scaling Feedback
- **ID**: DNA-007
- **Severity**: info
- **Description**: Primary buttons should scale down slightly (to 98%) when clicked, providing physical haptic feedback.
- **Rationale**: Improves the tactile feel of digital button actions (Framer and Apple interactive detail).
- **Allowed Values**: Scale transformations (e.g. `active:scale-[0.98]`).
- **Anti-Pattern**: Static buttons with zero dimensional feedback on click.
- **Preferred Pattern**: Button: `transition-transform duration-100 active:scale-[0.98]`.
- **Refactoring Guidance**: Add active scale transitions to primary action buttons.

### Rule: DNA-008 - Concentric Corner Radii Math
- **ID**: DNA-008
- **Severity**: error
- **Description**: Outer border radius values must be larger than nested inner container radii, following concentric corner geometry.
- **Rationale**: When inner corners match outer corners exactly, the margin space looks pinched and distorted.
- **Allowed Values**: Outer Radius = Inner Radius + Padding.
- **Anti-Pattern**: Nesting a card with `rounded-xl` inside a container that also uses `rounded-xl`.
- **Preferred Pattern**: Outer container `rounded-xl` (12px) with `p-2` (8px) padding, wrapping an inner element with `rounded-md` (6px).
- **Refactoring Guidance**: Scale down nested child corner radii to maintain clean concentric paths.

### Rule: DNA-009 - Muted CSS Loading Spinners
- **ID**: DNA-009
- **Severity**: warning
- **Description**: Avoid bulky custom loading GIFs or animated characters. Use thin, single-line CSS ring spinners instead.
- **Rationale**: Keeps loading states clean and consistent with a premium product aesthetic.
- **Allowed Values**: Muted single-color spinners.
- **Anti-Pattern**: Bulky custom loading bars or multi-colored spin animations.
- **Preferred Pattern**: Spinner: `w-5 h-5 border-2 border-neutral-300 border-t-neutral-800 rounded-full animate-spin`.
- **Refactoring Guidance**: Replace custom loading animations with clean CSS spinners.

### Rule: DNA-010 - Viewport Edge Clearance Margins
- **ID**: DNA-010
- **Severity**: error
- **Description**: Overlay dialog modals must keep a minimum offset boundary margin of 16px from viewport edges.
- **Rationale**: Avoids visual cropping on mobile and prevents UI breakages on tiny displays.
- **Allowed Values**: min-margin: 16px (1rem).
- **Anti-Pattern**: Modal templates spanning 100% width on phone screens without side margins.
- **Preferred Pattern**: Outer overlay container with `p-4 flex items-center justify-center` wrapping the modal.
- **Refactoring Guidance**: Ensure modal wrapper has wrapper paddings of at least `p-4` to enforce the safe viewport area.

### Rule: DNA-011 - Tabular Figures Monospaced Formatting
- **ID**: DNA-011
- **Severity**: error
- **Description**: Values that update dynamically (counters, timers, monetary sums) must use tabular numbers or monospace font styles.
- **Rationale**: Monospaced tabular numbers prevent layout jitter or horizontal shifting when numbers update.
- **Allowed Values**: `font-mono` or CSS font-variant-numeric: `tabular-nums`.
- **Anti-Pattern**: Standard sans-serif numbers in updating timer widgets or active counters.
- **Preferred Pattern**: Numeric ticker using class `font-mono tabular-nums`.
- **Refactoring Guidance**: Apply `font-mono` or `tabular-nums` class directly to currency/metric displays.

### Rule: DNA-012 - Sentence Case Heading Standards
- **ID**: DNA-012
- **Severity**: info
- **Description**: All page headings must use sentence-casing. Title-casing and all-caps headings are discouraged.
- **Rationale**: Sentence case is easier to read quickly and feels more conversational.
- **Allowed Values**: Sentence-case formatting.
- **Anti-Pattern**: `### ALL HEADINGS SHOUTING IN UPPERCASE` or `### Heading With Every Word Capitalized`.
- **Preferred Pattern**: `### Spacing and grid layouts`.
- **Refactoring Guidance**: Convert text strings to sentence case.

### Rule: DNA-013 - High-Contrast Subtext Color Bounds
- **ID**: DNA-013
- **Severity**: error
- **Description**: Subtitles and descriptions must remain readable by utilizing contrast-compliant color variants.
- **Rationale**: Soft, low-contrast text is illegible, violating basic accessibility (WCAG AA standards).
- **Allowed Values**: min gray-500 equivalent in light mode, gray-400 in dark mode.
- **Anti-Pattern**: Using pale gray colors like `text-neutral-300` or `#d1d5db` for description paragraphs.
- **Preferred Pattern**: Subtitle body using `text-neutral-500 dark:text-neutral-400`.
- **Refactoring Guidance**: Swap light-gray styling classes to higher contrast versions like `text-gray-500` or `text-zinc-500`.

### Rule: DNA-014 - Font Size to Leading Ratios
- **ID**: DNA-014
- **Severity**: error
- **Description**: All text elements must specify a line-height. Small body text requires larger relative leading; headers require tighter relative leading.
- **Rationale**: Prevents text blocks from overlapping (cramped leading) or breaking up visually (excessive leading).
- **Allowed Values**: Body/paragraph: 1.5 to 1.6 (leading-relaxed); Interface/labels: 1.25 to 1.4 (leading-normal); Headers: 1.1 to 1.2 (leading-tight).
- **Anti-Pattern**: Sticking default `leading-none` on long body texts.
- **Preferred Pattern**: Use class `text-base leading-relaxed` for reading blocks; use `text-3xl font-bold leading-tight` for titles.
- **Refactoring Guidance**: Add corresponding leading tags to typography setups matching content roles.

### Rule: DNA-015 - Title-to-Body Association Proximity
- **ID**: DNA-015
- **Severity**: warning
- **Description**: The spacing between headers and their corresponding body text must be small (4px to 12px) to respect proximity laws.
- **Rationale**: Excessive spacing between headings and text splits the visual relationship, confusing layout reading flow.
- **Allowed Values**: 4px, 6px, 8px, 12px
- **Anti-Pattern**: Placing a large gap like `mb-8` (32px) directly below a section header before its paragraph text.
- **Preferred Pattern**: Use `space-y-2` on content wrapper layouts or `mb-2` on `<h3>` tags.
- **Refactoring Guidance**: Reduce bottom margins of header elements to a maximum of `mb-3` or `mb-2` (8px/12px).

### Rule: DNA-016 - Interactive Target Sizing Bounds
- **ID**: DNA-016
- **Severity**: error
- **Description**: All touch targets (buttons, links, click regions) must measure at least 44px by 44px (including padding).
- **Rationale**: Smaller targets lead to user frustration and misclicks, particularly on mobile viewports.
- **Allowed Values**: min-height: 44px; min-width: 44px.
- **Anti-Pattern**: Tiny icon buttons with `w-6 h-6` (24px) and zero active padding areas.
- **Preferred Pattern**: Small action buttons styled with `w-10 h-10 flex items-center justify-center`.
- **Refactoring Guidance**: Increase small icon button bounding sizes to `w-10 h-10` or pad with `p-2` interactive targets.

### Rule: DNA-017 - Visible Focus Rings Double Border Offset
- **ID**: DNA-017
- **Severity**: error
- **Description**: All interactive elements must show a high-contrast focus ring when focused using a keyboard.
- **Rationale**: Keyboard-only users need visual cues to track which element currently holds focus.
- **Allowed Values**: Double ring structure: offset space, then brand color focus ring.
- **Anti-Pattern**: Disabling focus states (`outline-none`) without providing an alternative focus indicator.
- **Preferred Pattern**: Button styled with `focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2`.
- **Refactoring Guidance**: Apply standard focus-visible rings to all button and anchor tags.

### Rule: DNA-018 - Image Mask Overlay Filters
- **ID**: DNA-018
- **Severity**: warning
- **Description**: Text overlays on images must use a desaturated darkening filter to ensure readability.
- **Rationale**: Light or busy spots in images make overlaid white text unreadable.
- **Allowed Values**: Overlay opacity >= 40% (e.g. bg-black/40).
- **Anti-Pattern**: Overlaying white text on raw image placeholders.
- **Preferred Pattern**: Image card: `bg-black/50` mask layer behind text.
- **Refactoring Guidance**: Add a translucent dark mask overlay between the image and text labels.

### Rule: DNA-019 - Non-Intrusive live alerts
- **ID**: DNA-019
- **Severity**: warning
- **Description**: Asynchronous UI updates (new toast notifications, status updates) must be announced using `aria-live="polite"` regions.
- **Rationale**: Visually hidden changes must be made audible so screen reader users are aware of background page updates.
- **Allowed Values**: `aria-live="polite"` (non-intrusive) or `aria-live="assertive"` (critical alerts).
- **Anti-Pattern**: Dynamic popups appearing without focus adjustments or aria-live announcements.
- **Preferred Pattern**: `<div aria-live="polite" class="toast-area">Successful save</div>`.
- **Refactoring Guidance**: Set `aria-live="polite"` on toast and notification wrapper containers.

### Rule: DNA-020 - Semantic Status colors standard
- **ID**: DNA-020
- **Severity**: error
- **Description**: Status indicator dots must map to standard semantic colors. Custom colors are prohibited.
- **Rationale**: Using random colors for statuses confuses users.
- **Allowed Values**: Green: active/live; Red: error/offline; Yellow: warning/paused; Grey: inactive/draft.
- **Anti-Pattern**: Using blue indicator dots for active systems.
- **Preferred Pattern**: Active dot: `bg-emerald-500`.
- **Refactoring Guidance**: Reset status indicator dot colors to standard semantic tokens.

### Rule: DNA-021 - Eyebrow uppercase headers tracking
- **ID**: DNA-021
- **Severity**: info
- **Description**: Eyebrow category labels must be styled with small text sizes, uppercase transformations, and tracking-widest classes.
- **Rationale**: Separates categories from headings clearly without adding layout weight.
- **Allowed Values**: text-xs, uppercase, tracking-widest.
- **Anti-Pattern**: Eyebrows styled in normal large text sizes.
- **Preferred Pattern**: `<span class="text-xs font-semibold uppercase tracking-widest text-primary-500">Security</span>`.
- **Refactoring Guidance**: Adjust eyebrow styling variables to `text-xs uppercase tracking-widest`.

### Rule: DNA-022 - Breadcrumb Separator Padding Gaps
- **ID**: DNA-022
- **Severity**: info
- **Description**: Breadcrumb navigation segments must have symmetric gaps of 8px or 12px around breadcrumb slash/arrow indicators.
- **Rationale**: Clean spacing establishes structural pathing without visual overcrowding.
- **Allowed Values**: 8px, 12px
- **Anti-Pattern**: Crumbs with dividers touching text or separated by wide gaps.
- **Preferred Pattern**: `<nav class="flex items-center gap-2">` spacing children crumbs.
- **Refactoring Guidance**: Use a container gap of `gap-2` (8px) on breadcrumb list tags.

### Rule: DNA-023 - Command Menu Translucent backdrop blurs
- **ID**: DNA-023
- **Severity**: error
- **Description**: Command palettes and modal backdrops must feature a subtle backdrop blur combined with a translucent dark overlay.
- **Rationale**: Creates depth separation, focusing attention on the active dialog while keeping background context visible.
- **Allowed Values**: `backdrop-blur-sm` (4px) or `backdrop-blur-md` (8px).
- **Anti-Pattern**: Solid dark grey backdrop masks with zero transparency or blur filters.
- **Preferred Pattern**: Backdrop overlay styled with `bg-neutral-950/40 backdrop-blur-sm`.
- **Refactoring Guidance**: Append `backdrop-blur-sm` to modal backdrop styles.

### Rule: DNA-024 - Alt Attributes on visual graphics
- **ID**: DNA-024
- **Severity**: error
- **Description**: All `<img>` elements must include a valid descriptive `alt` attribute or specify `role="presentation"` for decorative images.
- **Rationale**: Screen readers rely on alt text to describe image contents to users with visual impairments.
- **Allowed Values**: Non-empty text string for content images; empty `alt=""` or `role="presentation"` for decorative graphics.
- **Anti-Pattern**: `<img src="avatar.png">` or using generic filenames like `alt="image.jpg"`.
- **Preferred Pattern**: `<img src="profile.jpg" alt="Jane Doe profile avatar" />`.
- **Refactoring Guidance**: Inspect images and insert descriptive alt tags or add `role="presentation"` for decorative shapes.

### Rule: DNA-025 - Consistent Icon Weight families
- **ID**: DNA-025
- **Severity**: error
- **Description**: Do not mix outline and solid icon styles within the same component or navigation menu.
- **Rationale**: Mixing icon styles looks unpolished and breaks the visual harmony of the interface.
- **Allowed Values**: Single visual style (outline-only or solid-only).
- **Anti-Pattern**: Nav bar showing a solid Home icon next to an outlined Settings icon.
- **Preferred Pattern**: Menu using outlined Lucide icons consistently.
- **Refactoring Guidance**: Standardize icon libraries to use a single visual style throughout the interface.

### Rule: DNA-026 - Custom Selection overlay hues
- **ID**: DNA-026
- **Severity**: info
- **Description**: Custom text selection colors must match brand theme colors.
- **Rationale**: Custom selection overrides fit visual systems better than browser default colors.
- **Allowed Values**: selection:bg-brand/N opacity settings.
- **Anti-Pattern**: Leaving default bright blue selection highlights on monochromatic interfaces.
- **Preferred Pattern**: Global class `selection:bg-blue-500/30 selection:text-white`.
- **Refactoring Guidance**: Configure custom text selection highlights in the root css setup.

### Rule: DNA-027 - Disabled visual state rules
- **ID**: DNA-027
- **Severity**: warning
- **Description**: Disabled controls must be clearly distinguishable, using light gray backdrops and desaturated icons.
- **Rationale**: Prevents users from attempting to click inactive elements.
- **Allowed Values**: Contrast ratio >= 3.0:1 for text on disabled inputs.
- **Anti-Pattern**: Fading a disabled button slightly, leaving it looking active but unresponsive.
- **Preferred Pattern**: Disabled state: `bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed`.
- **Refactoring Guidance**: Apply standard disabled states with low-saturation backgrounds and cursors.

### Rule: DNA-028 - Button padding aspect ratios
- **ID**: DNA-028
- **Severity**: warning
- **Description**: Interactive button horizontal padding must be exactly 1.5x to 2x the vertical padding size.
- **Rationale**: Symmetrical padding makes buttons look vertically bloated, whereas wider side padding improves button readability and tap targets.
- **Allowed Values**: ratio [1.5x to 2.0x] (e.g. py-2 px-4, py-1.5 px-3).
- **Anti-Pattern**: `py-4 px-4` or `p-3` on normal text buttons.
- **Preferred Pattern**: `px-4 py-2` (horizontal 16px, vertical 8px) or `px-3 py-1.5` (horizontal 12px, vertical 6px).
- **Refactoring Guidance**: Set horizontal padding to twice the vertical value for all text-containing button containers.

### Rule: DNA-029 - Tab Active indicator lines
- **ID**: DNA-029
- **Severity**: warning
- **Description**: Active tab states must be marked with a thin 2px bottom line or a sliding pill background.
- **Rationale**: Keeps tab selections clear and visually aligned with minimalist design systems.
- **Allowed Values**: 2px bottom borders or sliding pill containers.
- **Anti-Pattern**: Highlighting active tabs with heavy colored blocks or oversized borders.
- **Preferred Pattern**: Active tab: `border-b-2 border-blue-600 text-neutral-900`.
- **Refactoring Guidance**: Reset tab indicator styling to thin borders or sliding pills.

### Rule: DNA-030 - Status Indicator Dot Pulse physics
- **ID**: DNA-030
- **Severity**: info
- **Description**: Active status indicators (e.g. "Live" dots) should feature a subtle pulse animation.
- **Rationale**: Visually communicates active status without requiring distracting alerts.
- **Allowed Values**: Subtle, slow-pulsing animations.
- **Anti-Pattern**: Static colored dots or fast-flashing indicator circles.
- **Preferred Pattern**: Status green dot with an overlapping pulse circle styled with `animate-ping`.
- **Refactoring Guidance**: Add a secondary ping-animated indicator dot to status controls.
