# Color System Design Governance

This document outlines color palette constraints, contrast requirements, semantic associations, dark mode rules, and gradient systems. These specifications prevent high-contrast glare, rainbow dashboards, and inconsistent interactive states.

## Rules

### Rule: COLOR-001 - Approved Color Palette Only
- **ID**: COLOR-001
- **Severity**: error
- **Description**: Hardcoded hex code, rgb, or color strings are not permitted. Only use colors defined in CSS variables or tailwind theme configs.
- **Rationale**: Keeps colors maintainable and enables theme switching (light/dark mode) to work automatically.
- **Allowed Values**: CSS theme variables (e.g. `var(--color-primary-500)`), Tailwind color tokens (`bg-slate-50`, `text-zinc-900`).
- **Anti-Pattern**: Writing styles like `color: '#3490dc'` or `background-color: 'rgb(24, 12, 54)'` directly in UI elements.
- **Preferred Pattern**: Element styled with `bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50`.
- **Refactoring Guidance**: Map arbitrary hex/rgb values to the closest design token color classes.

### Rule: COLOR-002 - Semantic Color Meanings
- **ID**: COLOR-002
- **Severity**: error
- **Description**: Semantic colors (danger, success, warning, info) must only be used for their designated UI statuses.
- **Rationale**: Reusing semantic colors for decorative items confuses users and dilutes state indicator signals.
- **Allowed Values**: Danger: Red/Rose, Success: Green/Emerald, Warning: Yellow/Amber, Info: Blue/Indigo.
- **Anti-Pattern**: Using red backgrounds for neutral toggle buttons, or green highlights for warning callouts.
- **Preferred Pattern**: Danger alert: `text-red-600 bg-red-50 border-red-200`.
- **Refactoring Guidance**: Replace aesthetic semantic overrides with standard theme brand colors.

### Rule: COLOR-003 - Minimum Contrast Ratio (WCAG AA)
- **ID**: COLOR-003
- **Severity**: error
- **Description**: Main body copy and readable text must maintain a contrast ratio of at least 4.5:1 against their background.
- **Rationale**: Low text contrast prevents users with visual impairments from reading content.
- **Allowed Values**: WCAG AA contrast ratio >= 4.5:1.
- **Anti-Pattern**: Placing light gray text (`#94a3b8`) on white backgrounds (`#ffffff`).
- **Preferred Pattern**: Paragraph copy styled with `text-slate-600` or `#475569` on white backdrops.
- **Refactoring Guidance**: Darken body text color declarations to at least `text-neutral-700` or `text-zinc-600` on light backgrounds.

### Rule: COLOR-004 - Avoid Pure Black Backgrounds
- **ID**: COLOR-004
- **Severity**: warning
- **Description**: Avoid using pure black (`#000000` / `bg-black`) for dark mode backdrops. Use charcoal, slate, or off-black shades instead.
- **Rationale**: Pure black causes high contrast glare against white text, increasing eye strain. Subtle dark grays look more premium.
- **Allowed Values**: Dark grays (e.g., `#09090b` (zinc-950), `#0f172a` (slate-900), `#121212`).
- **Anti-Pattern**: Setting dark mode body backgrounds to `#000000`.
- **Preferred Pattern**: Dark mode backdrop configured as `bg-neutral-950` or `bg-slate-900`.
- **Refactoring Guidance**: Update dark mode body background styles to zinc-950 or neutral-950.

### Rule: COLOR-005 - Border Opacity Overlays
- **ID**: COLOR-005
- **Severity**: warning
- **Description**: Card and element borders must be subtle. Use light gray borders in light mode and translucent black borders in dark mode.
- **Rationale**: Thick, high-contrast borders fragment layouts. Subtle overlays look clean and blend with background elements.
- **Allowed Values**: Light mode: `border-slate-100` or `border-zinc-200/50`. Dark mode: `border-white/10` or `border-zinc-800/80`.
- **Anti-Pattern**: Using thick `#cccccc` solid black borders for dashboard card panels.
- **Preferred Pattern**: Border card styled with `border border-neutral-100 dark:border-neutral-800/60`.
- **Refactoring Guidance**: Soften border colors by shifting classes to neutral-100 or using opacity layers.

### Rule: COLOR-006 - Desaturated Alert Backdrops
- **ID**: COLOR-006
- **Severity**: warning
- **Description**: Notification boxes and alert banners must use light desaturated background tints combined with highly saturated text.
- **Rationale**: Bright, fully saturated backgrounds look cheap and make overlay text difficult to read.
- **Allowed Values**: Alert background opacity 5% to 15% (e.g. bg-rose-500/10).
- **Anti-Pattern**: Solid red background banners containing white text for standard alerts.
- **Preferred Pattern**: Warning badge: `bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20`.
- **Refactoring Guidance**: Swap solid warning colors to translucent background tints (`bg-red-500/10` instead of `bg-red-500`).

### Rule: COLOR-007 - Rainbow Dashboard Prevention
- **ID**: COLOR-007
- **Severity**: warning
- **Description**: Limit interactive layouts to a maximum of three core accent colors.
- **Rationale**: Too many concurrent colors compete for user attention, reducing the utility of secondary color signals.
- **Allowed Values**: Max 3 distinct accent colors (e.g., brand blue, success green, danger red).
- **Anti-Pattern**: Mixing yellow, orange, violet, pink, and teal icons across a single navigation panel.
- **Preferred Pattern**: Dashboard UI relying on slate colors with blue accent buttons and green indicator badges.
- **Refactoring Guidance**: Consolidate disparate icon colors to monochromatic or brand-accent variables.

### Rule: COLOR-008 - Dominant Color Ratios (60-30-10 Rule)
- **ID**: COLOR-008
- **Severity**: info
- **Description**: Layout page assemblies must follow the 60-30-10 distribution: 60% dominant neutral background, 30% structural components/cards, 10% accent highlights.
- **Rationale**: Maintains visual order and anchors the user's attention onto primary callouts.
- **Allowed Values**: 60% Neutral, 30% Structural, 10% Accent.
- **Anti-Pattern**: Applying primary brand colors to large layout zones like sidebar headers and background grids.
- **Preferred Pattern**: Light background (60%), white card blocks with thin grays (30%), blue primary buttons (10%).
- **Refactoring Guidance**: Move primary brand background fills out of non-interactive layout components.

### Rule: COLOR-009 - Dark Mode Contrast Offsets
- **ID**: COLOR-009
- **Severity**: warning
- **Description**: Large body text in dark mode must be styled with soft white (`#e4e4e7` or `#f4f4f5`) instead of pure white (`#ffffff`).
- **Rationale**: Reduces contrast glare and prevents text from blurring/glowing on bright OLED panels.
- **Allowed Values**: zinc-300, zinc-200, slate-300, slate-200 (e.g. `#e2e8f0` or `#f1f5f9`).
- **Anti-Pattern**: Setting body copy color in dark mode to pure `#ffffff`.
- **Preferred Pattern**: Text component styled with `text-zinc-900 dark:text-zinc-200`.
- **Refactoring Guidance**: Replace `dark:text-white` on body copy with `dark:text-zinc-200` or `dark:text-slate-300`.

### Rule: COLOR-010 - Gradient Restriction
- **ID**: COLOR-010
- **Severity**: error
- **Description**: Avoid using linear gradients on standard buttons or control items. Restrict gradients to branding marks and background glows.
- **Rationale**: Rainbow gradients look cheap and dates UI elements quickly. Stripe/Linear use gradients very selectively.
- **Allowed Values**: Gradients on background shapes/branding only.
- **Anti-Pattern**: Styled form fields using colorful vertical linear gradients.
- **Preferred Pattern**: Solid primary button using `bg-blue-600 hover:bg-blue-700 text-white`.
- **Refactoring Guidance**: Remove custom gradient styles from input inputs and small buttons.

### Rule: COLOR-011 - Disabled Component States
- **ID**: COLOR-011
- **Severity**: warning
- **Description**: Disabled controls must be clearly distinguishable, using light gray backdrops and desaturated icons.
- **Rationale**: Prevents users from attempting to click inactive elements.
- **Allowed Values**: Contrast ratio >= 3.0:1 for text on disabled inputs.
- **Anti-Pattern**: Fading a disabled button slightly, leaving it looking active but unresponsive.
- **Preferred Pattern**: Disabled state: `bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed`.
- **Refactoring Guidance**: Apply standard disabled states with low-saturation backgrounds and cursors.

### Rule: COLOR-012 - Interactive Hover Brightness Shift
- **ID**: COLOR-012
- **Severity**: error
- **Description**: Action items (buttons, links) must shift their background color brightness by exactly 5% to 10% on hover.
- **Rationale**: Provides immediate confirmation that an element is interactive.
- **Allowed Values**: Shading offset (e.g. bg-blue-600 hover:bg-blue-700).
- **Anti-Pattern**: Button hovering states having identical colors, or changing to completely unrelated hues (e.g., blue to orange).
- **Preferred Pattern**: Solid item: `bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-100`.
- **Refactoring Guidance**: Configure consistent hover shade transformations on interactive items.

### Rule: COLOR-013 - Keyboard Focus Rings
- **ID**: COLOR-013
- **Severity**: error
- **Description**: All interactive elements must show a high-contrast focus ring when focused using a keyboard.
- **Rationale**: Keyboard-only users need visual cues to track which element currently holds focus.
- **Allowed Values**: Double ring structure: offset space, then brand color focus ring.
- **Anti-Pattern**: Disabling focus states (`outline-none`) without providing an alternative focus indicator.
- **Preferred Pattern**: Button styled with `focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2`.
- **Refactoring Guidance**: Apply standard focus-visible rings to all button and anchor tags.

### Rule: COLOR-014 - Table Row Zebra Contrast Striping
- **ID**: COLOR-014
- **Severity**: info
- **Description**: Alternate table row background stripes must use a contrast difference of no more than 2% relative to default rows.
- **Rationale**: Subtle zebra shading structures data without adding distracting horizontal patterns.
- **Allowed Values**: Light mode: white (#ffffff) vs slate-50 (#f8fafc). Dark mode: zinc-900 vs zinc-900/50.
- **Anti-Pattern**: High contrast alternating white and dark gray table rows.
- **Preferred Pattern**: Data row layout using `even:bg-slate-50/50 dark:even:bg-zinc-900/30`.
- **Refactoring Guidance**: Soften zebra background styles to the lowest visible opacity values.

### Rule: COLOR-015 - Skeleton Loader Animation Colors
- **ID**: COLOR-015
- **Severity**: warning
- **Description**: Skeleton placeholder loading cards must use desaturated gray background colors with pulse animation effects.
- **Rationale**: Prevents loading states from drawing excessive attention or looking like empty active cards.
- **Allowed Values**: zinc-100 to zinc-200 (light mode), zinc-800 to zinc-700 (dark mode).
- **Anti-Pattern**: Skeletons styled using bright brand colors or static dark gray structures.
- **Preferred Pattern**: Loading block: `animate-pulse bg-neutral-200/60 dark:bg-neutral-800/80 rounded-md`.
- **Refactoring Guidance**: Set loading skeletons to neutral gray values and apply pulse animations.

### Rule: COLOR-016 - Interactive Input Focus Borders
- **ID**: COLOR-016
- **Severity**: error
- **Description**: Text input borders must transition from neutral gray to the primary brand color when active/focused.
- **Rationale**: Visually signals that the text field is ready to receive user input.
- **Allowed Values**: Focus transition configurations.
- **Anti-Pattern**: Input fields keeping identical border designs when active or hovered.
- **Preferred Pattern**: Input: `border-neutral-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500`.
- **Refactoring Guidance**: Apply focus border and ring transformations to inputs.

### Rule: COLOR-017 - Shadow Color Standards
- **ID**: COLOR-017
- **Severity**: warning
- **Description**: Drop shadows must use soft dark translucent grays with high alpha transparency. Colored/glowing shadows are not permitted.
- **Rationale**: Maintains a realistic depth model; shadows should simulate ambient occlusion, not glow.
- **Allowed Values**: Opacities between 2% and 8% (e.g. `rgba(0, 0, 0, 0.04)`).
- **Anti-Pattern**: Blue or purple glow drop shadows on standard cards.
- **Preferred Pattern**: Card panel with `shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]`.
- **Refactoring Guidance**: Soften box shadows to low-alpha dark opacity values.

### Rule: COLOR-018 - Scrollbar System Styling
- **ID**: COLOR-018
- **Severity**: info
- **Description**: Custom scrollbar thumbs must match adjacent themes and use translucent styling.
- **Rationale**: Default bright gray browser scrollbars break layout styling consistency.
- **Allowed Values**: Thumb color matched to theme neutral-400 dark:neutral-700 range.
- **Anti-Pattern**: Leaving wide, bright blue scrollbars on minimalist layouts.
- **Preferred Pattern**: Custom CSS scrollbars matching theme grays.
- **Refactoring Guidance**: Add scrollbar style rules to root styles.

### Rule: COLOR-019 - Modal Overlay Background Opacity
- **ID**: COLOR-019
- **Severity**: error
- **Description**: Overlay backdrops behind modals must use deep translucent grays paired with subtle backdrop blurs.
- **Rationale**: Screens background content and pulls focus onto the modal.
- **Allowed Values**: backdrop-blur (e.g., `bg-zinc-950/40 backdrop-blur-sm`).
- **Anti-Pattern**: solid dark overlays or transparent backdrops with zero blurs.
- **Preferred Pattern**: Modal backdrop overlay: `bg-slate-900/40 backdrop-blur-sm`.
- **Refactoring Guidance**: Set modal backdrops to translucent slate/zinc with blur filters.

### Rule: COLOR-020 - Chart Color Series Ordering
- **ID**: COLOR-020
- **Severity**: warning
- **Description**: Data charts must display data points using the design system's approved sequence order.
- **Rationale**: Inconsistent coloring across charts confuses users when comparing dashboard metrics.
- **Allowed Values**: Standardized color palette indices (e.g. Series 1: Blue, Series 2: Emerald, Series 3: Amber).
- **Anti-Pattern**: Rendering random color arrays for chart data points.
- **Preferred Pattern**: Inject theme array values to chart instances.
- **Refactoring Guidance**: Link dashboard charts to use the global theme color palette.

### Rule: COLOR-021 - Decorative Divider Opacity
- **ID**: COLOR-021
- **Severity**: warning
- **Description**: Partition borders and dividers must be styled with low-opacity grays.
- **Rationale**: Heavy lines fragment layouts, creating visual clutter.
- **Allowed Values**: Light mode: `border-neutral-100` or `border-zinc-200/50`. Dark mode: `border-zinc-800/80` or `border-neutral-900`.
- **Anti-Pattern**: Solid gray `#888888` borders separating small list rows.
- **Preferred Pattern**: Divider: `border-t border-neutral-100 dark:border-neutral-800/60`.
- **Refactoring Guidance**: Reduce divider border weights and opacity settings.

### Rule: COLOR-022 - Code block Syntax Palettes
- **ID**: COLOR-022
- **Severity**: info
- **Description**: Code blocks must use quiet, low-contrast syntax themes. Avoid neon colors.
- **Rationale**: Improves code readability and matches dark interfaces.
- **Allowed Values**: Muted syntax palettes (e.g., Tokyo Night, GitHub Muted).
- **Anti-Pattern**: Syntax highlighting templates containing neon green, hot pink, and bright yellow.
- **Preferred Pattern**: Code container with zinc-900 backdrops and desaturated syntax highlighting.
- **Refactoring Guidance**: Apply standard syntax color templates to code blocks.

### Rule: COLOR-023 - Icon Element Color Hierarchy
- **ID**: COLOR-023
- **Severity**: warning
- **Description**: Non-interactive icons must match the styling hierarchy of adjacent text labels.
- **Rationale**: Icons that are too bright compete with headings; icons that are too dark look disabled.
- **Allowed Values**: Muted text classes (e.g. text-neutral-400).
- **Anti-Pattern**: Bright blue status indicator icons next to muted description texts.
- **Preferred Pattern**: Info block containing `<IconInfo class="text-neutral-400" />` next to labels.
- **Refactoring Guidance**: Set icon colors to match text colors or use text-neutral-400.

### Rule: COLOR-024 - Translucent Status Badges
- **ID**: COLOR-024
- **Severity**: warning
- **Description**: Status badges must use translucent background tints combined with darker text.
- **Rationale**: Bright solid badge colors distract from primary call-to-actions.
- **Allowed Values**: Background opacity 10% to 15%.
- **Anti-Pattern**: Solid bright green badges containing white text.
- **Preferred Pattern**: Status badge styled with `bg-emerald-500/10 text-emerald-700 dark:text-emerald-300`.
- **Refactoring Guidance**: Update status badge backgrounds to translucent tints and adjust text contrast.

### Rule: COLOR-025 - Dark Mode Neutral Gray Consistency
- **ID**: COLOR-025
- **Severity**: error
- **Description**: Do not mix slate, zinc, and neutral dark grays within the same interface.
- **Rationale**: Mixing different undertones (warm vs. cool grays) looks unpolished and breaks visual system continuity.
- **Allowed Values**: Choose one: slate (cool blue-gray), zinc (clean gray), stone (warm gray).
- **Anti-Pattern**: Using `bg-slate-900` for the page background and `bg-zinc-800` for card layouts.
- **Preferred Pattern**: Consistently use zinc shades (`bg-zinc-950` with `bg-zinc-900` cards).
- **Refactoring Guidance**: Audit dark mode classes and convert warm/cool grays to a single family.

### Rule: COLOR-026 - Button Active Click states
- **ID**: COLOR-026
- **Severity**: warning
- **Description**: Interactive buttons must shift shade/opacity by an additional 5% when clicked/active.
- **Rationale**: Confirms that a tap/click action has registered.
- **Allowed Values**: Active state transformations (e.g. `active:bg-blue-800`).
- **Anti-Pattern**: Buttons showing identical colors when hovered and clicked.
- **Preferred Pattern**: Solid primary: `bg-blue-600 hover:bg-blue-700 active:bg-blue-800`.
- **Refactoring Guidance**: Add active state color classes to button selectors.

### Rule: COLOR-027 - Link Hover State Transformations
- **ID**: COLOR-027
- **Severity**: warning
- **Description**: Hovered text links must shift their color shade by at least 10%.
- **Rationale**: Visually signals that the link text is interactive.
- **Allowed Values**: Hover shade shifts.
- **Anti-Pattern**: Links keeping identical colors when hovered.
- **Preferred Pattern**: Link: `text-blue-600 hover:text-blue-700`.
- **Refactoring Guidance**: Add hover color shifts to text link components.

### Rule: COLOR-028 - Image Overlay Darkening Layers
- **ID**: COLOR-028
- **Severity**: warning
- **Description**: Text overlay overlays on images must use a desaturated darkening filter to ensure readability.
- **Rationale**: Light or busy spots in images make overlaid white text unreadable.
- **Allowed Values**: Overlay opacity >= 40% (e.g. bg-black/40).
- **Anti-Pattern**: Overlaying white text on raw image placeholders.
- **Preferred Pattern**: Image card: `bg-black/50` mask layer behind text.
- **Refactoring Guidance**: Add a translucent dark mask overlay between the image and text labels.

### Rule: COLOR-029 - Focus States for Form Inputs
- **ID**: COLOR-029
- **Severity**: error
- **Description**: Form inputs must use a distinct focus state that highlights the active field.
- **Rationale**: Helps users track which form field currently has focus.
- **Allowed Values**: Focus border and glow adjustments.
- **Anti-Pattern**: Leaving default browser outlines on text inputs.
- **Preferred Pattern**: Input: `focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`.
- **Refactoring Guidance**: Configure custom focus border and ring styles on input fields.

### Rule: COLOR-030 - Dark Mode Brand Accent Adjustments
- **ID**: COLOR-030
- **Severity**: warning
- **Description**: Brand colors used on dark backdrops must be lightened slightly to maintain contrast.
- **Rationale**: Colors look darker on dark backgrounds, reducing their legibility.
- **Allowed Values**: Lighten brand accents by one step in dark mode (e.g. primary-600 to primary-500).
- **Anti-Pattern**: Using identical dark primary blues (`bg-blue-700`) for buttons in both light and dark modes.
- **Preferred Pattern**: Button: `bg-blue-600 dark:bg-blue-500`.
- **Refactoring Guidance**: Adjust dark mode brand color overrides to use lighter accents.
