# Spacing & Grid System Design Governance

This document defines spacing, layout grids, padding, margins, and structural containment rules. These specifications prevent crowded layouts, unharmonious sizing, and generic template alignments.

## Rules

### Rule: SPACE-001 - Modular Spacing Scale
- **ID**: SPACE-001
- **Severity**: error
- **Description**: All layout padding, margins, and gaps must strictly adhere to the modular spacing scale. Custom arbitrary values are forbidden.
- **Rationale**: Using multiples of 4px eliminates visual noise and establishes a mathematically consistent vertical and horizontal rhythm.
- **Allowed Values**: 0px, 2px, 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px, 80px, 96px, 128px
- **Anti-Pattern**: Using custom values like `padding: 13px` or `margin-left: 17px`.
- **Preferred Pattern**: Using predefined tailwind classes or variables like `p-3` (12px), `m-4` (16px), or `gap-8` (32px).
- **Refactoring Guidance**: Adjust custom pixel heights/paddings/margins to the nearest approved multiple of 4px.

### Rule: SPACE-002 - Responsive Page Margins
- **ID**: SPACE-002
- **Severity**: error
- **Description**: Outer page containers must maintain a responsive horizontal margin corresponding to screen width breakpoints.
- **Rationale**: Guarantees content remains readable and does not touch screen edges on smaller viewports.
- **Allowed Values**: Mobile: min 16px; Tablet: min 32px; Desktop: min 48px; Max-width: 1280px (80rem) or 1440px (90rem).
- **Anti-Pattern**: Hardcoded margins or wide layout containers stretching edge-to-edge without padding.
- **Preferred Pattern**: Use `.mx-auto .px-4 .md:px-8 .lg:px-12 .max-w-7xl` class layouts.
- **Refactoring Guidance**: Wrap root page templates in a container with responsive horizontal padding and a centered max-width.

### Rule: SPACE-003 - Card Inner Padding Proportions
- **ID**: SPACE-003
- **Severity**: warning
- **Description**: Card component paddings must scale proportionally with the card size, starting at a minimum of 16px.
- **Rationale**: Cards require sufficient breathing room to isolate their content visually from adjacent page components.
- **Allowed Values**: Small card: 16px (1rem), Medium card: 24px (1.5rem), Large card: 32px (2rem).
- **Anti-Pattern**: Using small `p-2` (8px) padding inside large informational card structures.
- **Preferred Pattern**: Implement `p-4` for compact panels, `p-6` or `p-8` for standard layout sections.
- **Refactoring Guidance**: Upgrade card outer wrapper container paddings from `p-2` or `p-3` to at least `p-4` or `p-6`.

### Rule: SPACE-004 - Button Padding Aspect Ratio
- **ID**: SPACE-004
- **Severity**: warning
- **Description**: Interactive button horizontal padding must be exactly 1.5x to 2x the vertical padding size.
- **Rationale**: Symmetrical padding makes buttons look vertically bloated, whereas wider side padding improves button readability and tap targets.
- **Allowed Values**: ratio [1.5x to 2.0x] (e.g. py-2 px-4, py-1.5 px-3).
- **Anti-Pattern**: `py-4 px-4` or `p-3` on normal text buttons.
- **Preferred Pattern**: `px-4 py-2` (horizontal 16px, vertical 8px) or `px-3 py-1.5` (horizontal 12px, vertical 6px).
- **Refactoring Guidance**: Set horizontal padding to twice the vertical value for all text-containing button containers.

### Rule: SPACE-005 - Header proximity (Title-to-Body Gap)
- **ID**: SPACE-005
- **Severity**: warning
- **Description**: The spacing between headers and their corresponding body text must be small (4px to 12px) to respect proximity laws.
- **Rationale**: Excessive spacing between headings and text splits the visual relationship, confusing layout reading flow.
- **Allowed Values**: 4px, 6px, 8px, 12px
- **Anti-Pattern**: Placing a large gap like `mb-8` (32px) directly below a section header before its paragraph text.
- **Preferred Pattern**: Use `space-y-2` on content wrapper layouts or `mb-2` on `<h3>` tags.
- **Refactoring Guidance**: Reduce bottom margins of header elements to a maximum of `mb-3` or `mb-2` (8px/12px).

### Rule: SPACE-006 - Nested Card Padding Reduction
- **ID**: SPACE-006
- **Severity**: warning
- **Description**: Nested containers must have smaller padding than their parent containers to maintain nesting depth proportions.
- **Rationale**: Identical paddings break layout grids and overwhelm outer box boundaries.
- **Allowed Values**: Nested padding < Parent padding (e.g., Parent `p-6`, Child `p-4`).
- **Anti-Pattern**: Nesting a `p-6` container inside another `p-6` card wrapper.
- **Preferred Pattern**: Outer container `p-6` (24px) wrapping an inner section with `p-4` (16px).
- **Refactoring Guidance**: Audit nested components and scale down child paddings by one step on the spacing scale.

### Rule: SPACE-007 - Section Vertical Spacing Scale
- **ID**: SPACE-007
- **Severity**: warning
- **Description**: Top-level landing page or app screen sections must use vertical gaps of 64px to 128px to allow pages to breathe.
- **Rationale**: High-end designs (Apple/Linear) use wide gaps to pace content absorption and prevent visual fatigue.
- **Allowed Values**: 64px, 80px, 96px, 128px (e.g. py-16, py-20, py-24, py-32).
- **Anti-Pattern**: Placing major feature highlights right after another with a small `my-4` or `my-8` margin.
- **Preferred Pattern**: Separate page sections with `py-16 md:py-24` or use a grid gap of `gap-y-24`.
- **Refactoring Guidance**: Double the vertical padding/margin of primary container page blocks.

### Rule: SPACE-008 - Flex and Grid Column-Row Symmetry
- **ID**: SPACE-008
- **Severity**: info
- **Description**: Gaps in grid and flex layouts must be explicitly defined for both rows and columns.
- **Rationale**: Prevents elements from colliding or shifting awkwardly when wrapping occurs on smaller screens.
- **Allowed Values**: Defined gap token or explicit `gap-x` and `gap-y`.
- **Anti-Pattern**: Using `flex flex-wrap` with only horizontal margin spacing on children.
- **Preferred Pattern**: Use `flex flex-wrap gap-4` or `grid grid-cols-2 gap-x-8 gap-y-6`.
- **Refactoring Guidance**: Replace margin-based sibling spacing in flex containers with flex `gap` properties.

### Rule: SPACE-009 - Form Control Vertical Margin
- **ID**: SPACE-009
- **Severity**: error
- **Description**: Form input items (label, input, description) must use structured vertical stack gaps of 6px to 8px.
- **Rationale**: Proper labeling association requires inputs to be closer to labels than they are to adjacent inputs.
- **Allowed Values**: 6px, 8px
- **Anti-Pattern**: Packing inputs close together or having labels float independently with large margins.
- **Preferred Pattern**: Form field wrapper with `flex flex-col gap-1.5` containing label, input, and helper text.
- **Refactoring Guidance**: Standardize group layout wrapper gaps to `gap-1.5` or `gap-2` for label-to-input associations.

### Rule: SPACE-010 - Icon to Text Micro-Spacing
- **ID**: SPACE-010
- **Severity**: warning
- **Description**: The gap between an inline icon and its accompanying label/text must be exactly 6px or 8px.
- **Rationale**: Icons are visual cues and must cluster tightly with text to signify unified action.
- **Allowed Values**: 6px, 8px (0.375rem, 0.5rem).
- **Anti-Pattern**: Button layout with `gap-4` (16px) or text next to an icon with zero spacing.
- **Preferred Pattern**: Inline flex element with `space-x-2` or `gap-2` (8px) or `gap-1.5` (6px).
- **Refactoring Guidance**: Change button/inline gaps between icon indicators and text values to `gap-1.5` (6px) or `gap-2` (8px).

### Rule: SPACE-011 - Empty State Padding Depth
- **ID**: SPACE-011
- **Severity**: info
- **Description**: Empty state boxes and placeholders must maintain extra vertical breathing space to emphasize inactivity.
- **Rationale**: Generous spacing emphasizes empty state layouts and draws user focus to main call-to-actions.
- **Allowed Values**: min-height: 240px; vertical padding: min 48px.
- **Anti-Pattern**: Tiny empty state card with `p-4` containing tiny text and buttons.
- **Preferred Pattern**: Centered flex box with `py-16 px-8 text-center border border-dashed`.
- **Refactoring Guidance**: Set empty state wrappers to at least `py-12` or `py-16`.

### Rule: SPACE-012 - Nav Bar Vertical Height Constraint
- **ID**: SPACE-012
- **Severity**: error
- **Description**: Global headers and navbar heights must remain thin and stable to maximize viewport area.
- **Rationale**: Thick navigation bars distract focus and reduce screen space for core content.
- **Allowed Values**: 56px to 72px height range (h-14 to h-18).
- **Anti-Pattern**: Header bars spanning `h-24` (96px) or thick padded custom headers.
- **Preferred Pattern**: Navigation bar with `h-16 flex items-center justify-between px-6 border-b`.
- **Refactoring Guidance**: Reset header elements to a height of `h-16` (64px) and vertically center contents.

### Rule: SPACE-013 - Popover Offset Clearances
- **ID**: SPACE-013
- **Severity**: error
- **Description**: Overlay dropdowns, tooltips, and popovers must have a clear offset of exactly 8px from their trigger elements.
- **Rationale**: Prevents overlays from blocking trigger details and maintains depth perspective in hierarchical components.
- **Allowed Values**: 8px (0.5rem).
- **Anti-Pattern**: Dropdown menus overlapping button triggers or floating far away with 20px gaps.
- **Preferred Pattern**: Positioning classes or Popper/Floating UI setting `offset: 8`.
- **Refactoring Guidance**: Use `mt-2` on static absolute components or verify placement library offset arguments.

### Rule: SPACE-014 - Table Row Density padding
- **ID**: SPACE-014
- **Severity**: warning
- **Description**: Table cells must use density padding to match information complexity and layout scope.
- **Rationale**: Crowded tables prevent data scanning; overly spacious cells make tables too long.
- **Allowed Values**: Premium/Standard: 14px to 16px (py-3.5, py-4); Compact/Data-heavy: 8px to 10px (py-2, py-2.5).
- **Anti-Pattern**: Data density layout using `py-6` or `py-1` arbitrarily.
- **Preferred Pattern**: Standard data grid with `td class="px-4 py-3.5"`.
- **Refactoring Guidance**: Set table layout padding classes explicitly to `py-3` (12px) or `py-3.5` (14px).

### Rule: SPACE-015 - Breadcrumb Divider Margins
- **ID**: SPACE-015
- **Severity**: info
- **Description**: Breadcrumb navigation segments must have symmetric gaps of 8px or 12px around breadcrumb slash/arrow indicators.
- **Rationale**: Clean spacing establishes structural pathing without visual overcrowding.
- **Allowed Values**: 8px, 12px
- **Anti-Pattern**: Crumbs with dividers touching text or separated by wide gaps.
- **Preferred Pattern**: `<nav class="flex items-center gap-2">` spacing children crumbs.
- **Refactoring Guidance**: Use a container gap of `gap-2` (8px) on breadcrumb list tags.

### Rule: SPACE-016 - Modal Viewport Offset Margins
- **ID**: SPACE-016
- **Severity**: error
- **Description**: Overlay dialog modals must keep a minimum offset boundary margin of 16px from viewport edges.
- **Rationale**: Avoids visual cropping on mobile and prevents UI breakages on tiny displays.
- **Allowed Values**: min-margin: 16px (1rem).
- **Anti-Pattern**: Modal templates spanning 100% width on phone screens without side margins.
- **Preferred Pattern**: Outer overlay container with `p-4 flex items-center justify-center` wrapping the modal.
- **Refactoring Guidance**: Ensure modal wrapper has wrapper paddings of at least `p-4` to enforce the safe viewport area.

### Rule: SPACE-017 - Badge Border Padding Ratio
- **ID**: SPACE-017
- **Severity**: warning
- **Description**: Tag and badge elements must utilize small, precise padding proportions.
- **Rationale**: Large padded tags compete with primary buttons; narrow tags look cramped.
- **Allowed Values**: py-0.5 px-2 (2px vertical, 8px horizontal) or py-1 px-2.5 (4px vertical, 10px horizontal).
- **Anti-Pattern**: Tag buttons styled with `py-2 px-4` or `p-2`.
- **Preferred Pattern**: Status badge styled with `px-2 py-0.5 text-xs font-medium`.
- **Refactoring Guidance**: Standardize badge elements to `py-0.5 px-2` or equivalent variables.

### Rule: SPACE-018 - Sidebar Content Layout Widths
- **ID**: SPACE-018
- **Severity**: warning
- **Description**: Layout sidebar panels must follow rigid standard width scales to maintain vertical grid structures.
- **Rationale**: Arbitrary sidebar sizing breaks visual layouts across pages.
- **Allowed Values**: 240px, 280px, 320px (w-60, w-70, w-80).
- **Anti-Pattern**: Sidebars set to `w-[311px]` or `width: 28%` dynamically.
- **Preferred Pattern**: Fixed sidebar component using `w-64` (256px) or `w-80` (320px).
- **Refactoring Guidance**: Standardize dashboard layouts to sidebar widths of `w-64` or `w-80`.

### Rule: SPACE-019 - Avatar Overlap Layout Gaps
- **ID**: SPACE-019
- **Severity**: info
- **Description**: Overlapping avatar list elements must stack with negative margins of exactly 8px or 12px.
- **Rationale**: Controls depth layer styling and prevents cluttered layouts.
- **Allowed Values**: -space-x-2 (-8px) or -space-x-3 (-12px).
- **Anti-Pattern**: Random overlaps or zero overlapping in stack layouts.
- **Preferred Pattern**: Stack list styled with `flex -space-x-2 overflow-hidden`.
- **Refactoring Guidance**: Use Tailwind negative spacing class `-space-x-2` on group wrappers.

### Rule: SPACE-020 - Segmented Tab Controls Gaps
- **ID**: SPACE-020
- **Severity**: error
- **Description**: Segmented controls (pill buttons inside a container) must use a 2px to 4px spacing track gap.
- **Rationale**: Grouped toggle items require minimal spacing to be perceived as a single control option.
- **Allowed Values**: 2px, 4px (gap-0.5, gap-1).
- **Anti-Pattern**: Separating toggle controls with wide spaces like `gap-4`.
- **Preferred Pattern**: Pill layout with `flex p-1 bg-neutral-100 dark:bg-neutral-900 rounded-lg gap-1`.
- **Refactoring Guidance**: Change inner wrapper gap to `gap-1` or `gap-0.5` with container padding.

### Rule: SPACE-021 - Stat Widget Vertical Spacings
- **ID**: SPACE-021
- **Severity**: warning
- **Description**: Stat card indicator metrics must stand out with exactly 4px or 8px of space between numbers and labels.
- **Rationale**: Separates label from measurement clearly without fracturing the widget's unity.
- **Allowed Values**: 4px, 8px
- **Anti-Pattern**: Margin spacing of 20px between metric number and label text.
- **Preferred Pattern**: Metric container with label first, then number spaced via `mt-1`.
- **Refactoring Guidance**: Adjust spacing elements inside stat cards to `gap-1` or `gap-2` top-to-bottom.

### Rule: SPACE-022 - Card Header-to-Body Separation Gaps
- **ID**: SPACE-022
- **Severity**: warning
- **Description**: Card header rows must separate from body content with a gap or padding of exactly 16px or 20px.
- **Rationale**: Isolates configuration/options bar from card details.
- **Allowed Values**: 16px (1rem), 20px (1.25rem).
- **Anti-Pattern**: Custom grid rows overlapping without padding or dividers.
- **Preferred Pattern**: Header section with `pb-4 border-b border-neutral-100` then body section with `pt-4`.
- **Refactoring Guidance**: Apply standard `p-4` or `p-5` spacing separation bounds inside card templates.

### Rule: SPACE-023 - Sticky Floating Panel Safe Offsets
- **ID**: SPACE-023
- **Severity**: warning
- **Description**: Fixed floating action bars or toast elements must position with a safe inset of exactly 16px, 24px, or 32px from the screen edge.
- **Rationale**: Prevents overlap with OS elements and keeps overlays floating nicely over general pages.
- **Allowed Values**: 16px, 24px, 32px
- **Anti-Pattern**: absolute panels stuck hard to the screen margin (`bottom-0 right-0`).
- **Preferred Pattern**: Toast container styled with `fixed bottom-6 right-6 z-50`.
- **Refactoring Guidance**: Change floating offsets to `bottom-4 right-4` or `bottom-6 right-6`.

### Rule: SPACE-024 - Hero Header Subtext Margins
- **ID**: SPACE-024
- **Severity**: info
- **Description**: Hero titles on splash screens must separate from subtitle descriptions by exactly 16px to 24px.
- **Rationale**: Paces visual entry hierarchy without disconnecting subtitle explanations.
- **Allowed Values**: 16px, 20px, 24px (mt-4, mt-5, mt-6).
- **Anti-Pattern**: Using huge margins (`mt-16`) or no margins (`mt-1`) below landing page headings.
- **Preferred Pattern**: Hero wrapper containing `<h1>` and a description paragraph with `mt-6 text-xl`.
- **Refactoring Guidance**: Reset heading-to-description gaps to `mt-6` or `mt-5`.

### Rule: SPACE-025 - Decorative Divider Vertical Padding
- **ID**: SPACE-025
- **Severity**: warning
- **Description**: Horizontal rules and visual partition line margins must be symmetrically set to 16px, 24px, or 32px.
- **Rationale**: Symmetrical padding keeps blocks balanced and prevents sections from sliding out of balance.
- **Allowed Values**: 16px, 24px, 32px (my-4, my-6, my-8).
- **Anti-Pattern**: Dividers with unbalanced margins like `mt-2 mb-8` or missing line breaks.
- **Preferred Pattern**: Hr element with class `my-6 border-t border-neutral-100`.
- **Refactoring Guidance**: Standardize dividers to `my-6` (24px) or `my-4` (16px) margins.

### Rule: SPACE-026 - Keyboard Shortcut Badge Margins
- **ID**: SPACE-026
- **Severity**: info
- **Description**: Key cap shortcut indicators (kbd) inside lists must be placed 12px or 16px away from command labels.
- **Rationale**: Leaves clean horizontal paths to scan shortcut columns.
- **Allowed Values**: 12px, 16px (ml-3, ml-4, or gap-3).
- **Anti-Pattern**: Shortcuts running directly into label text endings.
- **Preferred Pattern**: Row layout with `flex justify-between items-center gap-4` pushing `<kbd>` right.
- **Refactoring Guidance**: Use `ml-auto` or `justify-between` with a solid spacer gap.

### Rule: SPACE-027 - Grid Layout Gap Max Bounds
- **ID**: SPACE-027
- **Severity**: warning
- **Description**: Grid layout columns must never exceed a spacing gap of 48px to prevent fragmented columns.
- **Rationale**: Excessively wide column gaps disrupt linear eye tracking.
- **Allowed Values**: Max 48px (gap-12, or gap-x-12).
- **Anti-Pattern**: Column spaces set to `gap-24` or `gap-32` on typical dashboard designs.
- **Preferred Pattern**: Multi-column container with `gap-6` (24px) or `gap-8` (32px).
- **Refactoring Guidance**: Clamp column grids spacing configurations to `gap-8` or `gap-6`.

### Rule: SPACE-028 - List Item Content Gaps
- **ID**: SPACE-028
- **Severity**: warning
- **Description**: Rows in user option lists or setting groups must maintain vertical spacings of 8px to 12px.
- **Rationale**: Keeps option lists compact and highly legible without merging rows.
- **Allowed Values**: 8px, 10px, 12px (space-y-2, space-y-3).
- **Anti-Pattern**: Stacking interactive list rows with large card paddings.
- **Preferred Pattern**: Stack items list using `divide-y divide-neutral-100` with `py-3` per child item.
- **Refactoring Guidance**: Align item inner row vertical paddings to `py-2.5` (10px) or `py-3` (12px).

### Rule: SPACE-029 - Page Top Header Space offset
- **ID**: SPACE-029
- **Severity**: error
- **Description**: Main content area below fixed headers must offset with top padding of at least 24px.
- **Rationale**: Keeps fixed navigation headers from visual collision with main content.
- **Allowed Values**: min 24px (pt-6) or offset corresponding to navbar height.
- **Anti-Pattern**: Page content sliding underneath nav bars on scroll without top spacers.
- **Preferred Pattern**: Main wrapper element styled with `pt-24 pb-12 px-6`.
- **Refactoring Guidance**: Ensure content container includes top padding or margin buffer of `pt-20` or `pt-24`.

### Rule: SPACE-030 - Interactive Target Minimum Bounds
- **ID**: SPACE-030
- **Severity**: error
- **Description**: All touch targets (buttons, links, click regions) must measure at least 44px by 44px (including padding).
- **Rationale**: Smaller targets lead to user frustration and misclicks, particularly on mobile viewports.
- **Allowed Values**: min-height: 44px; min-width: 44px.
- **Anti-Pattern**: Tiny icon buttons with `w-6 h-6` (24px) and zero active padding areas.
- **Preferred Pattern**: Small action buttons styled with `w-9 h-9 flex items-center justify-center` or custom padded targets.
- **Refactoring Guidance**: Increase small icon button bounding sizes to `w-10 h-10` or pad with `p-2` interactive targets.
