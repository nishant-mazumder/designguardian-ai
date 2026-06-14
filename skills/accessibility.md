# Accessibility Design Governance

This document establishes screen reader compatibility, keyboard navigation, interactive target bounds, focus behaviors, and sensory aid rules. These specifications ensure compliance with WCAG 2.1 AA/AAA standards and prevent broken assistive flows.

## Rules

### Rule: ACC-001 - Image Alt Attributes
- **ID**: ACC-001
- **Severity**: error
- **Description**: All `<img>` elements must include a valid descriptive `alt` attribute or specify `role="presentation"` for decorative images.
- **Rationale**: Screen readers rely on alt text to describe image contents to users with visual impairments.
- **Allowed Values**: Non-empty text string for content images; empty `alt=""` or `role="presentation"` for decorative graphics.
- **Anti-Pattern**: `<img src="avatar.png">` or using generic filenames like `alt="image.jpg"`.
- **Preferred Pattern**: `<img src="profile.jpg" alt="Jane Doe profile avatar" />`.
- **Refactoring Guidance**: Inspect images and insert descriptive alt tags or add `role="presentation"` for decorative shapes.

### Rule: ACC-002 - Aria Labels on Icon Controls
- **ID**: ACC-002
- **Severity**: error
- **Description**: Interactive controls (buttons, links) containing only icons must specify a clear `aria-label` or `aria-labelledby` attribute.
- **Rationale**: Prevents screen readers from announcing buttons simply as "button", which doesn't explain what action it triggers.
- **Allowed Values**: Explicit descriptive string.
- **Anti-Pattern**: `<button><IconTrash /></button>`.
- **Preferred Pattern**: `<button aria-label="Delete user workspace"><IconTrash /></button>`.
- **Refactoring Guidance**: Identify textless controls and add descriptive `aria-label` properties.

### Rule: ACC-003 - Accessible Form Field Labeling
- **ID**: ACC-003
- **Severity**: error
- **Description**: All inputs must associate with a `<label>` element using matching `for` (or `htmlFor` in React) and `id` properties.
- **Rationale**: Connects inputs with their labels so screen readers can announce form instructions correctly.
- **Allowed Values**: Pair matching (label `for` value matches input `id`).
- **Anti-Pattern**: Wrapping inputs directly in text without matching ID associations.
- **Preferred Pattern**: `<label htmlFor="email">Email</label><input id="email" type="email" />`.
- **Refactoring Guidance**: Add explicit `id` attributes to inputs and link them to corresponding `<label>` tags.

### Rule: ACC-004 - Keyboard Focus Navigable Dropdowns
- **ID**: ACC-004
- **Severity**: error
- **Description**: Option select menu dropdowns must be expandable using Enter/Space and navigable with Up/Down arrow keys.
- **Rationale**: Keyboard-only users must be able to select menu items without relying on a mouse.
- **Allowed Values**: Keyboard events mapping.
- **Anti-Pattern**: Custom JS dropdown lists that only respond to hover or click events.
- **Preferred Pattern**: Dropdowns built with proper keyboard navigation listeners or accessible libraries (e.g. Radix).
- **Refactoring Guidance**: Implement keyboard event handlers (`onKeyDown`) for custom options components.

### Rule: ACC-005 - Semantic Layout Landmarks
- **ID**: ACC-005
- **Severity**: error
- **Description**: Layout templates must use HTML5 semantic tags (`<header>`, `<main>`, `<nav>`, `<footer>`, `<aside>`) to define page structures.
- **Rationale**: Semantic landmarks allow screen reader users to quickly navigate to different regions of a page.
- **Allowed Values**: Use of semantic HTML tags.
- **Anti-Pattern**: Structuring entire pages using generic nested `<div>` blocks.
- **Preferred Pattern**: `<header>Navbar</header><main>Main feed</main><footer>Footer details</footer>`.
- **Refactoring Guidance**: Swap layout-level wrapper `<div>` nodes for appropriate HTML5 landmark tags.

### Rule: ACC-006 - Modal Dialog Focus Trapping
- **ID**: ACC-006
- **Severity**: error
- **Description**: When a modal overlays a page, focus must be trapped inside the modal container and not bleed into background elements.
- **Rationale**: Prevents keyboard users from navigating behind the modal and getting lost in background links.
- **Allowed Values**: Focus trap implementation.
- **Anti-Pattern**: Leaving focus free to navigate to background header links when a modal dialog is active.
- **Preferred Pattern**: Modals using focus trap libraries or custom key listener boundaries.
- **Refactoring Guidance**: Integrate focus trapping libraries (e.g., Focus-Trap, Radix Dialog) into overlay components.

### Rule: ACC-007 - Sequential Headings Order
- **ID**: ACC-007
- **Severity**: error
- **Description**: Headings must follow a sequential hierarchy (`<h1>` to `<h6>`) without skipping steps.
- **Rationale**: Correct document hierarchies allow screen readers to build accurate outline maps of page content.
- **Allowed Values**: Sequential nesting (e.g., H1 -> H2 -> H3, no skips).
- **Anti-Pattern**: Using `<h3>` for main page banners, or nesting `<h4>` directly below `<h1>`.
- **Preferred Pattern**: `<h1>Title</h1><h2>Section heading</h2><h3>Subsection detail</h3>`.
- **Refactoring Guidance**: Restructure heading tags to follow an ordered, logical progression.

### Rule: ACC-008 - Visible Keyboard Outlines
- **ID**: ACC-008
- **Severity**: error
- **Description**: Never hide default browser focus outlines (`outline-none`) without replacing them with custom focus indicators.
- **Rationale**: Keyboard-only users need visual cues to track which element currently holds focus.
- **Allowed Values**: Explicit visible focus states (e.g. `focus-visible:ring-2`).
- **Anti-Pattern**: Styling buttons with `focus:outline-none` and providing no alternative focus indicator.
- **Preferred Pattern**: `focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500`.
- **Refactoring Guidance**: Replace all instances of `outline-none` with accessible `focus-visible` outline styles.

### Rule: ACC-009 - Interactive Click Target Size
- **ID**: ACC-009
- **Severity**: error
- **Description**: All interactive elements (buttons, links, form inputs) must have a minimum click/touch target size of 44px by 44px.
- **Rationale**: Ensures touch targets are easy to tap on mobile screens, particularly for users with limited motor control.
- **Allowed Values**: Bounding target >= 44px.
- **Anti-Pattern**: Tiny icon buttons with `w-6 h-6` (24px) and zero active padding areas.
- **Preferred Pattern**: Action buttons styled with `w-10 h-10 flex items-center justify-center`.
- **Refactoring Guidance**: Add spacing/padding or size overrides to ensure target regions meet the 44px limit.

### Rule: ACC-010 - Information Multi-Coding (Not Color Only)
- **ID**: ACC-010
- **Severity**: error
- **Description**: Color must not be the only visual indicator used to convey status, errors, or critical info. Always accompany color with text or icons.
- **Rationale**: Colorblind users may not be able to distinguish between different status colors (e.g., red and green indicators).
- **Allowed Values**: Text or icon pairing.
- **Anti-Pattern**: Signaling form errors *only* by turning the border of the input field red.
- **Preferred Pattern**: Red border paired with an error icon and a clear descriptive text warning.
- **Refactoring Guidance**: Add text labels or icon cues alongside color changes to convey state.

### Rule: ACC-011 - Responsive Layout Zoom Support
- **ID**: ACC-011
- **Severity**: warning
- **Description**: Elements containing text must not use fixed heights that block text scaling up to 200%.
- **Rationale**: Users with visual impairments may scale text sizes up, which causes text to clip if containers have fixed heights.
- **Allowed Values**: Avoid hardcoded pixel heights; use dynamic layout bounds like `min-h-N` instead.
- **Anti-Pattern**: Cards styled with fixed heights like `h-[120px]`, causing wrapping text to overflow and clip.
- **Preferred Pattern**: Containers styled with `min-h-[120px] py-4` to adapt to wrapped text blocks.
- **Refactoring Guidance**: Convert fixed container heights (`h-N`) to minimum heights (`min-h-N`) or use vertical padding.

### Rule: ACC-012 - Error Descriptors Links
- **ID**: ACC-012
- **Severity**: warning
- **Description**: Form error text messages must link to their corresponding inputs using `aria-describedby`.
- **Rationale**: Directs screen readers to announce error messages when the user focuses on the invalid input field.
- **Allowed Values**: Matching `aria-describedby` value to error message element `id`.
- **Anti-Pattern**: Error messages rendered next to inputs with no structural link.
- **Preferred Pattern**: `<input id="email" aria-describedby="email-error" /><p id="email-error">Invalid email</p>`.
- **Refactoring Guidance**: Link error paragraphs to inputs using `aria-describedby`.

### Rule: ACC-013 - Skip Content Links
- **ID**: ACC-013
- **Severity**: info
- **Description**: Web interfaces must include a "Skip to main content" link as the first focusable element on the page.
- **Rationale**: Keyboard-only users can skip past long navigation menus and jump directly to main page content.
- **Allowed Values**: Visible skip link on focus.
- **Anti-Pattern**: Missing skip content anchors, forcing users to tab through entire nav headers on every page reload.
- **Preferred Pattern**: `<a href="#main" class="sr-only focus:not-sr-only">Skip to main content</a>`.
- **Refactoring Guidance**: Insert skip link blocks immediately after the opening `<body>` tag.

### Rule: ACC-014 - Autoplay Audio & Video Restrictions
- **IDennial**: error
- **Description**: Audio or video clips must not autoplay. If media autoplays, it must include a global pause control.
- **Rationale**: Autoplay audio can interfere with screen reader announcements, making it difficult for users to hear navigation cues.
- **Allowed Values**: Autoplay disabled or include mute controls.
- **Anti-Pattern**: Background promotional videos playing on landing pages with default audio enabled.
- **Preferred Pattern**: Video elements configured with `muted playInline controls`.
- **Refactoring Guidance**: Ensure all media tags include the `muted` attribute or disable autoplay entirely.

### Rule: ACC-015 - Reduced Motion Support (Prefers-Reduced-Motion)
- **ID**: ACC-015
- **Severity**: warning
- **Description**: CSS animations and transitions must respect user system preferences for reduced motion.
- **Rationale**: Rapid animations or flashing screens can trigger seizures or cause dizziness for sensitive users.
- **Allowed Values**: Use of media query `prefers-reduced-motion: reduce`.
- **Anti-Pattern**: Infinite hover loops or complex scrolling parallax effects that cannot be disabled.
- **Preferred Pattern**: CSS animations configured to quiet down inside `@media (prefers-reduced-motion: reduce)`.
- **Refactoring Guidance**: Wrap CSS keyframe animations in prefers-reduced-motion queries or disable complex transitions.

### Rule: ACC-016 - Iframe Title Attributes
- **ID**: ACC-016
- **Severity**: error
- **Description**: All `<iframe>` elements must include a descriptive `title` attribute.
- **Rationale**: Screen readers rely on iframe titles to explain what external content is loaded inside the frame.
- **Allowed Values**: Non-empty description string.
- **Anti-Pattern**: `<iframe src="https://maps.google.com"></iframe>`.
- **Preferred Pattern**: `<iframe title="Interactive Google Map of head office location" src="https://maps.google.com"></iframe>`.
- **Refactoring Guidance**: Identify `<iframe>` nodes and apply descriptive `title` attributes.

### Rule: ACC-017 - Semantic Table Headers
- **ID**: ACC-017
- **Severity**: error
- **Description**: Table headers must be built using `<th>` tags configured with explicit `scope="col"` or `scope="row"` attributes.
- **Rationale**: Helps screen readers associate data cells with their corresponding headers, making tables easier to parse.
- **Allowed Values**: Table header tags configured with `scope`.
- **Anti-Pattern**: Building table headers using bold styled `<td>` cells.
- **Preferred Pattern**: `<tr><th scope="col">Name</th><th scope="col">Status</th></tr>`.
- **Refactoring Guidance**: Convert text style overrides in table headers to proper semantic `<th>` elements.

### Rule: ACC-018 - Descriptive Link Titles
- **ID**: ACC-018
- **Severity**: error
- **Description**: Anchor text must clearly explain where the link leads. Avoid generic labels like "click here" or "read more".
- **Rationale**: Screen reader users often list links on a page out of context, and generic labels fail to explain where they lead.
- **Allowed Values**: Descriptive text strings.
- **Anti-Pattern**: Paragraphs ending with `For detail, <a href="/docs">click here</a>`.
- **Preferred Pattern**: `Read the <a href="/docs">developer onboarding documentation</a> for details.`.
- **Refactoring Guidance**: Rephrase link text to clearly describe the target destination.

### Rule: ACC-019 - Dynamic Content Announcements (Aria-Live)
- **ID**: ACC-019
- **Severity**: warning
- **Description**: Asynchronous UI updates (new toast notifications, status updates) must be announced using `aria-live` regions.
- **Rationale**: Visually hidden changes must be made audible so screen reader users are aware of background page updates.
- **Allowed Values**: `aria-live="polite"` (non-intrusive) or `aria-live="assertive"` (critical alerts).
- **Anti-Pattern**: Dynamic popups appearing without focus adjustments or aria-live announcements.
- **Preferred Pattern**: `<div aria-live="polite" class="toast-area">Successful save</div>`.
- **Refactoring Guidance**: Set `aria-live="polite"` on toast and notification wrapper containers.

### Rule: ACC-020 - Language Document Declarations
- **ID**: ACC-020
- **Severity**: error
- **Description**: The root `<html>` tag must declare a valid `lang` attribute.
- **Rationale**: Sets the default speech synthesis accent for screen readers.
- **Allowed Values**: ISO language codes (e.g. `lang="en"`, `lang="es"`).
- **Anti-Pattern**: Missing language attributes, causing screen readers to fall back to system defaults.
- **Preferred Pattern**: `<html lang="en">`.
- **Refactoring Guidance**: Add a valid `lang` attribute to the root HTML template configuration.

### Rule: ACC-021 - Unique Page Titles
- **ID**: ACC-021
- **Severity**: error
- **Description**: Every page must have a descriptive, unique `<title>` tag.
- **Rationale**: Helps users quickly identify which tab or page they are currently viewing.
- **Allowed Values**: Descriptive, unique title strings.
- **Anti-Pattern**: Setting identical title tags (`<title>Home</title>`) across all pages of a web app.
- **Preferred Pattern**: `<title>Security Dashboard | DesignGuardian AI</title>`.
- **Refactoring Guidance**: Configure router page title tags to dynamically update and describe the active page.

### Rule: ACC-022 - SVG Descriptive Accessible Labels
- **ID**: ACC-022
- **Severity**: error
- **Description**: Inline `<svg>` icons must specify `aria-hidden="true"` if decorative, or include a `<title>` tag if they serve as interactive graphics.
- **Rationale**: Prevents screen readers from announcing raw SVG coordinate paths as gibberish.
- **Allowed Values**: `aria-hidden="true"` (decorative), or `<title>` combined with `role="img"` (content).
- **Anti-Pattern**: Raw SVG tags embedded in buttons with no titles or labels.
- **Preferred Pattern**: `<svg aria-hidden="true" class="icon"><path ... /></svg>`.
- **Refactoring Guidance**: Add `aria-hidden="true"` to decorative SVGs or insert description titles.

### Rule: ACC-023 - Focus State Restoration
- **ID**: ACC-023
- **Severity**: warning
- **Description**: When a dialog or modal closes, focus must automatically return to the element that triggered it.
- **Rationale**: Prevents keyboard focus from resetting to the top of the document when a modal is closed, preserving user progress.
- **Allowed Values**: Focus return handlers.
- **Anti-Pattern**: Closing a modal and leaving focus lost in the void, forcing users to tab from the top of the page again.
- **Preferred Pattern**: Modal component returning focus to the cached trigger element on close.
- **Refactoring Guidance**: Cache active trigger elements on modal open and call `.focus()` when the modal closes.

### Rule: ACC-024 - Accessible Abbreviations
- **ID**: ACC-024
- **Severity**: info
- **Description**: Use the `<abbr>` tag with a `title` attribute for uncommon abbreviations.
- **Rationale**: Explains technical jargon to assistive technologies.
- **Allowed Values**: Use of `<abbr>` tags.
- **Anti-Pattern**: Writing obscure abbreviations without styling or titles.
- **Preferred Pattern**: `<abbr title="World Wide Web Consortium">W3C</abbr>`.
- **Refactoring Guidance**: Wrap uncommon abbreviations in `<abbr>` elements with descriptive title attributes.

### Rule: ACC-025 - Tabindex Ordering Rules
- **ID**: ACC-025
- **Severity**: error
- **Description**: Avoid using `tabindex` values greater than 0. Only use 0 (default focusable) or -1 (programmatic focusable).
- **Rationale**: Positive tabindex values disrupt standard browser tab order, making keyboard navigation unpredictable.
- **Allowed Values**: tabindex="0", tabindex="-1".
- **Anti-Pattern**: Custom grids using `tabindex="3"` or `tabindex="5"` to manually force navigation order.
- **Preferred Pattern**: Re-order HTML markup to match natural reading layouts.
- **Refactoring Guidance**: Remove positive `tabindex` properties and re-arrange DOM order.

### Rule: ACC-026 - Avoid Placeholder Instructions
- **ID**: ACC-026
- **Severity**: error
- **Description**: Do not use placeholder attributes (`placeholder="..."`) as a replacement for labels or critical instructions.
- **Rationale**: Placeholders fade on input and have poor default contrast, making them inaccessible to many users.
- **Allowed Values**: None (placeholders can only be used as formatting hints).
- **Anti-Pattern**: Removing form labels and relying solely on inputs like `<input placeholder="Enter Username" />`.
- **Preferred Pattern**: Input paired with a visible `<label>` element and formatting hints.
- **Refactoring Guidance**: Restore visible labels and move placeholder text out of inputs.

### Rule: ACC-027 - Status Alert Aria Roles
- **ID**: ACC-027
- **Severity**: warning
- **Description**: Alert banners and status notifications must use appropriate ARIA roles (`role="alert"`, `role="status"`).
- **Rationale**: Ensures assistive tools immediately announce new messages to users.
- **Allowed Values**: role="alert", role="status".
- **Anti-Pattern**: Alert banners built using raw styled `<div>` elements with no status labels.
- **Preferred Pattern**: `<div role="alert" class="alert-box">Error saving workspace</div>`.
- **Refactoring Guidance**: Append correct ARIA roles to toast notifications and alert banners.

### Rule: ACC-028 - Accessibility Text Scaling Compatibility
- **ID**: ACC-028
- **Severity**: warning
- **Description**: Never use absolute positioning for long text blocks that might wrap and collide on text scale up.
- **Rationale**: Wrapped text will overlap adjacent layout boxes.
- **Allowed Values**: Auto-layout layouts.
- **Anti-Pattern**: Positioning paragraphs absolute with fixed offsets, causing text blocks to collide when scaled.
- **Preferred Pattern**: Wrap content in flex stacks that expand naturally when text wraps.
- **Refactoring Guidance**: Convert absolute layouts to flex/grid layouts.

### Rule: ACC-029 - Focusable Element Interactive Styling
- **ID**: ACC-029
- **Severity**: warning
- **Description**: Custom non-native interactive elements (e.g. custom div buttons) must declare role="button" and support keypress triggers.
- **Rationale**: Custom clickable divs must behave like native buttons for assistive technologies.
- **Allowed Values**: role="button" with key listeners.
- **Anti-Pattern**: `<div onClick={save}>Save</div>` with no key event handlers.
- **Preferred Pattern**: `<div role="button" tabIndex={0} onClick={save} onKeyDown={handleKeyPress}>Save</div>`.
- **Refactoring Guidance**: Add `role="button"`, `tabIndex={0}`, and keypress listeners to custom clickable elements.

### Rule: ACC-030 - Hiding Decorative Assets
- **ID**: ACC-030
- **Severity**: error
- **Description**: Purely decorative illustrations, spacer lines, and icons must be hidden from screen readers using `aria-hidden="true"`.
- **Rationale**: Reduces auditory noise for screen reader users by skipping non-essential visual elements.
- **Allowed Values**: aria-hidden="true".
- **Anti-Pattern**: Embedding complex SVGs or design background curves without hiding them.
- **Preferred Pattern**: `<div aria-hidden="true" class="bg-glow-dots"></div>`.
- **Refactoring Guidance**: Add `aria-hidden="true"` to decorative assets.
