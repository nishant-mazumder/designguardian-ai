# Typography Design Governance

This document establishes font scaling, line heights, letter spacing, font family pairings, and text readability rules. These standards prevent arbitrary sizes, cramped reading flow, and uncalibrated visual hierarchy.

## Rules

### Rule: TYPO-001 - Approved Font Families
- **ID**: TYPO-001
- **Severity**: error
- **Description**: Only use the design system's approved font families. Custom external font overrides are prohibited.
- **Rationale**: Keeps the visual tone aligned with our brand identities. Inter and system-ui are optimized for clean screen reading.
- **Allowed Values**: 'Inter', 'system-ui', '-apple-system', 'sans-serif', 'ui-monospace', 'monospace'
- **Anti-Pattern**: Using generic `font-serif` or introducing fonts like 'Comic Sans', 'Arial', or 'Roboto' ad-hoc.
- **Preferred Pattern**: Use class `font-sans` or `font-mono` mapped to Inter/system font stacks.
- **Refactoring Guidance**: Remove custom `font-family` CSS style declarations and use default theme variables.

### Rule: TYPO-002 - Standardized Font Sizes
- **ID**: TYPO-002
- **Severity**: error
- **Description**: Font sizes must correspond exactly to the design system's typographic scale.
- **Rationale**: Prevents erratic layout hierarchy and ensures a balanced distribution of text scales.
- **Allowed Values**: 11px, 12px, 14px, 16px, 18px, 20px, 24px, 30px, 36px, 48px, 60px
- **Anti-Pattern**: Using size styles like `font-size: 15px` or `text-[13px]`.
- **Preferred Pattern**: Select from `text-xs` (12px), `text-sm` (14px), `text-base` (16px), or `text-lg` (18px).
- **Refactoring Guidance**: Round up or down custom sizes to the nearest standard tailwind class or token.

### Rule: TYPO-003 - Proportional Line Heights (Leading)
- **ID**: TYPO-003
- **Severity**: error
- **Description**: All text elements must specify a line-height. Small body text requires larger relative leading; headers require tighter relative leading.
- **Rationale**: Prevents text blocks from overlapping (cramped leading) or breaking up visually (excessive leading).
- **Allowed Values**: Body/paragraph: 1.5 to 1.6 (leading-relaxed); Interface/labels: 1.25 to 1.4 (leading-normal); Headers: 1.1 to 1.2 (leading-tight).
- **Anti-Pattern**: Sticking default `leading-none` on long body texts.
- **Preferred Pattern**: Use class `text-base leading-relaxed` for reading blocks; use `text-3xl font-bold leading-tight` for titles.
- **Refactoring Guidance**: Add corresponding leading tags to typography setups matching content roles.

### Rule: TYPO-004 - Header Letter-Spacing (Tracking)
- **ID**: TYPO-004
- **Severity**: warning
- **Description**: Large headings (20px and above) must use negative letter-spacing to offset font optical expanding.
- **Rationale**: Tighter tracking on larger text displays keeps headers unified and feels premium (Apple/Linear signature).
- **Allowed Values**: -0.01em to -0.03em (tracking-tight, tracking-tighter).
- **Anti-Pattern**: Using normal or wide letter-spacing on huge title headers.
- **Preferred Pattern**: Title wrapper: `text-4xl font-extrabold tracking-tight`.
- **Refactoring Guidance**: Apply `tracking-tight` to headers from `text-lg` and `tracking-tighter` from `text-3xl`.

### Rule: TYPO-005 - Text Line Length Constraints
- **ID**: TYPO-005
- **Severity**: warning
- **Description**: Main body copy containers must be clamped to a maximum line length of 60 to 75 characters.
- **Rationale**: Long horizontal text spans tire readers, making it difficult to find the start of the next line.
- **Allowed Values**: 45ch to 75ch (max-width: 640px or `max-w-2xl`).
- **Anti-Pattern**: Text elements stretching across a wide screen width of 1920px.
- **Preferred Pattern**: Paragraph container styled with `max-w-2xl text-neutral-600`.
- **Refactoring Guidance**: Set a `max-w-2xl` or `max-w-prose` constraint on outer text sections.

### Rule: TYPO-006 - Letter-Spacing on Uppercase Labels
- **ID**: TYPO-006
- **Severity**: error
- **Description**: All uppercase text elements must be styled with expanded tracking to maintain legibility.
- **Rationale**: Capital letters lack ascending/descending shapes, running together when not padded with extra spacing.
- **Allowed Values**: min 0.05em (tracking-wide, tracking-wider, tracking-widest).
- **Anti-Pattern**: Uppercase styling `uppercase` without spacing modifiers.
- **Preferred Pattern**: Section eyebrow styled with `text-xs font-semibold uppercase tracking-wider`.
- **Refactoring Guidance**: Append `tracking-wider` or `tracking-wide` to all tag classes that include `uppercase`.

### Rule: TYPO-007 - Dynamic Value Tabular Figures
- **ID**: TYPO-007
- **Severity**: error
- **Description**: Values that update dynamically (counters, timers, monetary sums) must use tabular numbers or monospace font styles.
- **Rationale**: Monospaced tabular numbers prevent layout jitter or horizontal shifting when numbers update.
- **Allowed Values**: `font-mono` or CSS font-variant-numeric: `tabular-nums`.
- **Anti-Pattern**: Standard sans-serif numbers in updating timer widgets or active counters.
- **Preferred Pattern**: Numeric ticker using class `font-mono tabular-nums`.
- **Refactoring Guidance**: Apply `font-mono` or `tabular-nums` class directly to currency/metric displays.

### Rule: TYPO-008 - Font Weight Restrictions
- **ID**: TYPO-008
- **Severity**: warning
- **Description**: Limit active weight variants to a maximum of three inside a single component. Avoid hairline/thin weights.
- **Rationale**: Excessive weight mixing increases font bundle weight and creates messy visual hierarchies.
- **Allowed Values**: Regular (400), Medium (500), SemiBold (600), Bold (700).
- **Anti-Pattern**: Mixing Thin (100), Light (300), Regular, Medium, and Black (900) in one dashboard card.
- **Preferred Pattern**: Use Regular for body, Medium for primary actions/labels, SemiBold for headers.
- **Refactoring Guidance**: Remove font weights below 400 (light/thin) and replace with regular weight.

### Rule: TYPO-009 - Contrast-Preserving Subtext Colors
- **ID**: TYPO-009
- **Severity**: error
- **Description**: Subtitles and descriptions must remain readable by utilizing contrast-compliant color variants.
- **Rationale**: Soft, low-contrast text is illegible, violating basic accessibility (WCAG AA standards).
- **Allowed Values**: min gray-500 equivalent in light mode, gray-400 in dark mode.
- **Anti-Pattern**: Using pale gray colors like `text-neutral-300` or `#d1d5db` for description paragraphs.
- **Preferred Pattern**: Subtitle body using `text-neutral-500 dark:text-neutral-400`.
- **Refactoring Guidance**: Swap light-gray styling classes to higher contrast versions like `text-gray-500` or `text-zinc-500`.

### Rule: TYPO-010 - Paragraph Separation vertical margin
- **ID**: TYPO-010
- **Severity**: warning
- **Description**: Sibling paragraph tags must separate with explicit vertical margin classes instead of double line breaks.
- **Rationale**: Controls paragraph layouts systematically and prevents empty space clutter.
- **Allowed Values**: space-y-4, mb-4, or equivalent modular spacers.
- **Anti-Pattern**: Using `<br /><br />` to create paragraphs.
- **Preferred Pattern**: Parent container wrapping multiple paragraphs with `<div class="space-y-4">`.
- **Refactoring Guidance**: Remove empty `<br />` nodes and configure parent stack layout parameters.

### Rule: TYPO-011 - Text Truncation standard
- **ID**: TYPO-011
- **Severity**: warning
- **Description**: Dynamic strings (user names, file paths, emails) must be capped with explicit truncation rules to prevent layouts from expanding.
- **Rationale**: Prevents text overflows from breaking UI containers or layout structures.
- **Allowed Values**: CSS `truncate` or `line-clamp-N` classes.
- **Anti-Pattern**: Dynamic text nodes rendering without boundaries.
- **Preferred Pattern**: User item display styled with `<span class="truncate block">`.
- **Refactoring Guidance**: Wrap dynamic string outputs in a styling tag configured with `truncate` or `line-clamp-2`.

### Rule: TYPO-012 - Interactive Link Indicators
- **ID**: TYPO-012
- **Severity**: warning
- **Description**: Inline body links must look distinctly interactive, utilizing color offsets and hover underline actions.
- **Rationale**: Users need clear visual indicators to identify clickable anchor tags.
- **Allowed Values**: underline on hover, distinct brand color styling.
- **Anti-Pattern**: Links styled with identical colors and decorations to surrounding text.
- **Preferred Pattern**: Paragraph link configured with `text-blue-600 hover:underline`.
- **Refactoring Guidance**: Ensure links are styled with hover underlines and distinct hover states.

### Rule: TYPO-013 - Code Snippet Formatting Standards
- **ID**: TYPO-013
- **Severity**: info
- **Description**: Inline code blocks must use monospace fonts, rounded backdrops, and clear contrast padding.
- **Rationale**: Code segments must look distinct from regular text descriptions.
- **Allowed Values**: font-mono, px-1.5, py-0.5, bg-neutral-100 dark:bg-neutral-900.
- **Anti-Pattern**: Raw monospace text with no background separation.
- **Preferred Pattern**: Code element: `code class="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded"`.
- **Refactoring Guidance**: Format `<code>` wrappers to include padding and neutral backdrop classes.

### Rule: TYPO-014 - Title Case Heading Restrictions
- **ID**: TYPO-014
- **Severity**: info
- **Description**: All page headings must use sentence-casing. Title-casing and all-caps headings are discouraged for sentences.
- **Rationale**: Sentence case is easier to read quickly and feels more conversational.
- **Allowed Values**: Sentence-case formatting.
- **Anti-Pattern**: `### ALL HEADINGS SHOUTING IN UPPERCASE` or `### Heading With Every Word Capitalized`.
- **Preferred Pattern**: `### Spacing and grid layouts`.
- **Refactoring Guidance**: Convert text strings to sentence case.

### Rule: TYPO-015 - Form Input Text Minimum Sizing
- **ID**: TYPO-015
- **Severity**: error
- **Description**: Form inputs and text fields must use a minimum text size of 16px to prevent iOS Safari auto-zooming.
- **Rationale**: iOS Safari forces page zooming on input fields smaller than 16px, breaking desktop layout responsiveness.
- **Allowed Values**: min 16px (text-base or text-[16px]).
- **Anti-Pattern**: Compact input text styled with `text-xs` (12px) or `text-sm` (14px) on mobile viewports.
- **Preferred Pattern**: Text input with class `w-full px-3 py-2 text-base md:text-sm`.
- **Refactoring Guidance**: Force responsive fonts `text-base md:text-sm` so it scales down on desktop but remains 16px on mobile viewports.

### Rule: TYPO-016 - List Bullet Alignment
- **ID**: TYPO-016
- **Severity**: warning
- **Description**: List bullet characters or numbers must align with the top baseline of the list text.
- **Rationale**: Prevents markers from floating awkwardly when text spans multiple lines.
- **Allowed Values**: Align-top alignment classes.
- **Anti-Pattern**: Centering bullet marks vertically in items spanning three text lines.
- **Preferred Pattern**: Flex list layout using `items-start`.
- **Refactoring Guidance**: Adjust list container configurations to use top-aligned indicators.

### Rule: TYPO-017 - Quote/Blockquote System Styling
- **ID**: TYPO-017
- **Severity**: warning
- **Description**: Blockquote components must feature left border styling and distinct text coloring.
- **Rationale**: Visually signals citation and offsets review comments from main text content.
- **Allowed Values**: border-l-2 or border-l-4, pl-4, text-neutral-600 dark:text-neutral-300.
- **Anti-Pattern**: Quotes rendered as plain text in the middle of page files.
- **Preferred Pattern**: Blockquote styled with `pl-4 border-l-2 border-primary-500 italic text-zinc-600`.
- **Refactoring Guidance**: Add left border rules and italic styles to quote block nodes.

### Rule: TYPO-018 - Tooltip Font Limits
- **ID**: TYPO-018
- **Severity**: info
- **Description**: Tooltip overlay texts must remain small and compact to avoid cluttering hover regions.
- **Rationale**: Tooltips are compact helpers and must avoid screen space bloat.
- **Allowed Values**: text-xs (12px) size max.
- **Anti-Pattern**: Large padded tooltips styled with `text-lg`.
- **Preferred Pattern**: Tooltip popup container configured with `text-xs px-2 py-1`.
- **Refactoring Guidance**: Set tooltip font configurations to `text-xs`.

### Rule: TYPO-019 - Legal disclaimer font size bounds
- **ID**: TYPO-019
- **Severity**: error
- **Description**: Footer disclaimers and legal texts must be at least 11px to ensure minimal readability.
- **Rationale**: Prevents users from missing terms and safeguards basic interface accessibility.
- **Allowed Values**: min 11px (text-[11px] or text-xs).
- **Anti-Pattern**: Ultra-tiny footnotes styled with `text-[9px]` or `#fontSize: 8px`.
- **Preferred Pattern**: Footer terms styled with `text-[11px] text-zinc-400`.
- **Refactoring Guidance**: Increase footer footnotes to at least `text-xs` or `text-[11px]`.

### Rule: TYPO-020 - Badge Typography weight standard
- **ID**: TYPO-020
- **Severity**: warning
- **Description**: Badge labels must be styled with medium/semibold weights to ensure contrast in tiny boundaries.
- **Rationale**: Light font weights are unreadable when scaled down.
- **Allowed Values**: font-medium (500), font-semibold (600).
- **Anti-Pattern**: Badges styled with `font-light` (300).
- **Preferred Pattern**: Status badge element: `font-medium text-xs`.
- **Refactoring Guidance**: Replace badge element weight setups with `font-medium`.

### Rule: TYPO-021 - UI Text Selection Backdrops
- **ID**: TYPO-021
- **Severity**: info
- **Description**: Text selection highlights should be customized with the primary brand accent color.
- **Rationale**: Custom selection backdrops fit visual systems better than browser default colors.
- **Allowed Values**: selection:bg-brand/N opacity settings.
- **Anti-Pattern**: Leaving default bright blue selection highlights on dark/monochromatic pages.
- **Preferred Pattern**: Global class `selection:bg-blue-500/30 selection:text-white`.
- **Refactoring Guidance**: Configure custom text selection highlights in the root css setup.

### Rule: TYPO-022 - Accent Text Restrictions
- **ID**: TYPO-022
- **Severity**: warning
- **Description**: Italicized or colored highlight words must cover less than 5% of layout blocks.
- **Rationale**: Overuse of accents creates visual noise, weakening primary copy focus.
- **Allowed Values**: Accent ratio < 5%.
- **Anti-Pattern**: Styling multiple paragraphs entirely in bold or italics.
- **Preferred Pattern**: Keep body text normal, and highlight a single key phrase.
- **Refactoring Guidance**: Standardize overly styled paragraphs back to regular weights.

### Rule: TYPO-023 - Text Dropshadow Prevention
- **ID**: TYPO-023
- **Severity**: error
- **Description**: Do not apply dropshadow styles to interface text. Use solid background overlays instead.
- **Rationale**: Dropshadows on text look dated and reduce readability.
- **Allowed Values**: None
- **Anti-Pattern**: Header tags using `text-shadow` or class `drop-shadow`.
- **Preferred Pattern**: Clear high-contrast text on solid backgrounds.
- **Refactoring Guidance**: Remove `drop-shadow` classes or text-shadow properties from header elements.

### Rule: TYPO-024 - Hero Header Line Height (Leading)
- **ID**: TYPO-024
- **Severity**: warning
- **Description**: Hero page titles (36px and above) must keep tight leading heights of 1.1x to 1.15x.
- **Rationale**: Large typography with loose leading splits title visual blocks.
- **Allowed Values**: leading-[1.1] to leading-[1.2] range.
- **Anti-Pattern**: Hero titles styled with `leading-loose`.
- **Preferred Pattern**: Title heading configured with `text-5xl font-extrabold leading-[1.1]`.
- **Refactoring Guidance**: Reset hero headings line-height to `leading-none` or `leading-tight`.

### Rule: TYPO-025 - Button Text casing standard
- **ID**: TYPO-025
- **Severity**: error
- **Description**: Interactive buttons must use sentence case or title case. All-caps buttons are forbidden.
- **Rationale**: All-caps labels look aggressive and take longer for users to read.
- **Allowed Values**: Sentence case, Title case
- **Anti-Pattern**: Button labels like `SUBMIT FORM NOW` or `ADD TO CART`.
- **Preferred Pattern**: Button label styled as `Add to cart` or `Submit form`.
- **Refactoring Guidance**: Convert uppercase button titles to standard casing.

### Rule: TYPO-026 - Search dropdown query highlighting
- **ID**: TYPO-026
- **Severity**: info
- **Description**: Option dropdown lists must highlight query string matches inside item titles.
- **Rationale**: Simplifies lookup visual tracking.
- **Allowed Values**: matching character bolding.
- **Anti-Pattern**: Result list showing matches with identical styling to surrounding strings.
- **Preferred Pattern**: Match snippet wrapping query tokens in `<strong>` tags.
- **Refactoring Guidance**: Add match highlight wrapping filters in option components.

### Rule: TYPO-027 - Heading Hierarchies order
- **ID**: TYPO-027
- **Severity**: error
- **Description**: Headings must follow a strict sequential order (H1 -> H2 -> H3) without skips.
- **Rationale**: Inconsistent heading order breaks document structure and fails accessibility guidelines.
- **Allowed Values**: Structured heading progression.
- **Anti-Pattern**: Skipping H2 and nesting `<h3>` directly below a page `<h1>`.
- **Preferred Pattern**: H1 section title -> H2 subsection subtitle -> H3 section paragraph list.
- **Refactoring Guidance**: Correct skipped heading steps to build clean document structures.

### Rule: TYPO-028 - Icon Button Text labels
- **ID**: TYPO-028
- **Severity**: warning
- **Description**: Never include text labels inside narrow icon-only square button shapes.
- **Rationale**: Text becomes illegible and breaks alignment in round/square control structures.
- **Allowed Values**: None (text is replaced by aria-labels).
- **Anti-Pattern**: `<button class="w-8 h-8 rounded-full">Save</button>`.
- **Preferred Pattern**: `<button class="w-8 h-8 rounded-full" aria-label="Save"><IconSave /></button>`.
- **Refactoring Guidance**: Hide text labels in small circular items and apply `aria-label` properties.

### Rule: TYPO-029 - Text line-height collision prevention
- **ID**: TYPO-029
- **Severity**: error
- **Description**: Avoid using `line-height: 0` or values below `1` on multi-line text blocks.
- **Rationale**: Lines overlap and collide, rendering the text illegible.
- **Allowed Values**: line-height >= 1.
- **Anti-Pattern**: Setting `line-height: 0` to center text blocks vertically.
- **Preferred Pattern**: Flex/grid container layout centers text, preserving standard line-heights.
- **Refactoring Guidance**: Replace height alignments with flex centering properties.

### Rule: TYPO-030 - Eyebrow section titles
- **ID**: TYPO-030
- **Severity**: info
- **Description**: Eyebrow titles above main headings must use small text sizes, uppercase transformations, and tracking-widest classes.
- **Rationale**: Clearly flags categories without distracting from main titles.
- **Allowed Values**: text-xs, uppercase, tracking-widest.
- **Anti-Pattern**: Eyebrows styled in normal large text sizes.
- **Preferred Pattern**: `<span class="text-xs font-semibold uppercase tracking-widest text-primary-500">Security</span>`.
- **Refactoring Guidance**: Adjust eyebrow styling variables to `text-xs uppercase tracking-widest`.
