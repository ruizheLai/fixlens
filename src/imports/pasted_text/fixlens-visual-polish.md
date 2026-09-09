Refine the existing FixLens prototype with a final visual polish pass.

IMPORTANT:
- Preserve the existing information architecture, screen structure, user flows, navigation, and functionality.
- Do NOT redesign the product.
- Do NOT add new major features.
- Do NOT change the current reporting flow, case-tracking logic, AR capture flow, or general support chat structure.
- Keep the overall design simple, calm, clear, and trustworthy.
- The goal is to make the interface feel more polished, mature, and product-ready without making it visually busy.

--------------------------------------------------
1. KEEP THE CURRENT MINIMAL STYLE
--------------------------------------------------

The current simple UI direction is correct.

Do not introduce:
- strong gradients
- glassmorphism
- heavy shadows
- decorative illustrations
- 3D icons
- large colour blocks
- excessive animation
- futuristic visual effects

FixLens should still feel like a practical, trustworthy maintenance service app.

The refinement should come from:
- stronger visual hierarchy
- more consistent spacing
- more deliberate surface treatment
- more refined typography
- better state styling
- subtle brand details

--------------------------------------------------
2. REFINE THE SURFACE HIERARCHY
--------------------------------------------------

Currently many cards and containers use a similar white background + thin border treatment.

Create a clearer hierarchy between different surface types.

Use approximately three levels:

PRIMARY / INTERACTIVE SURFACE
For important actions or current case information:
- clean white surface
- subtle border
- very soft shadow or elevation only where useful
- slightly stronger visual presence

SECONDARY SURFACE
For ordinary list items, settings, and supporting content:
- white or very light neutral surface
- minimal border
- no obvious shadow

TONAL / STATUS SURFACE
For informational or status content:
- use very light tinted backgrounds instead of relying only on outlines
- keep colour subtle and accessible

Do not add shadows to every card.

--------------------------------------------------
3. REFINE CARD STYLING
--------------------------------------------------

Make card styling feel more intentional.

Review:
- Home action cards
- Recent Case card
- My Cases cards
- Case Detail information blocks
- Inbox notifications
- Profile sections
- Submitted Report sections

Keep the existing rounded language but make it more consistent.

Use:
- consistent corner radius
- consistent internal padding
- consistent border opacity
- more deliberate spacing between title, metadata, and status

Reduce the “all cards look identical” effect.

The Recent Case and active Case Detail should feel slightly more important than generic settings or historical content.

--------------------------------------------------
4. TYPOGRAPHY SYSTEM
--------------------------------------------------

Refine typography consistency across the prototype.

Maintain the existing clean sans-serif style.

Create clearer hierarchy between:

PAGE TITLE
- strongest text hierarchy
- bold / semibold

SECTION TITLE
- smaller
- semibold
- slightly muted when appropriate

CARD TITLE
- semibold
- strong contrast

BODY
- regular
- comfortable line height

METADATA
- smaller
- muted grey
- consistent size

STATUS LABELS
- compact
- medium / semibold

Avoid using too many different font sizes or weights.

Ensure the same type style is used consistently for similar information across Home, Cases, Inbox, Profile, and Case Detail.

--------------------------------------------------
5. SPACING RHYTHM
--------------------------------------------------

Review vertical and horizontal spacing across all screens.

Use a more systematic spacing rhythm.

Prefer a consistent scale such as:
- 4
- 8
- 12
- 16
- 20
- 24
- 32

Avoid arbitrary spacing differences between screens.

Pay particular attention to:
- page title → first section
- section label → card
- card → card
- title → supporting text
- status → metadata
- header → main content
- bottom content → bottom navigation

The interface should feel calm and evenly paced.

--------------------------------------------------
6. BRAND COLOUR USAGE
--------------------------------------------------

Preserve the current FixLens brand colours.

Primary:
- blue for main CTA and important active states

Secondary:
- teal only as a restrained supporting accent

Do not overuse teal.

Use teal selectively for:
- subtle confirmation states
- guidance indicators
- small supportive details
- selected evidence / capture feedback where appropriate

Keep most of the UI neutral so the blue primary actions remain visually dominant.

--------------------------------------------------
7. STATUS SYSTEM
--------------------------------------------------

Refine the semantic status styling across case cards, Case Detail, and Inbox.

Use subtle tinted pills / backgrounds rather than highly saturated colours.

Examples:

Awaiting approval
- warm amber tint
- dark amber text

Under review
- soft blue tint
- dark blue text

More information needed / Action required
- soft red or coral tint
- clear but not alarming

Repair scheduled
- soft teal / blue-green tint

Completed
- soft green tint
- visually quieter than active states

Use the same status colour consistently everywhere.

Do not use colour alone to communicate meaning.
Keep text labels visible.

--------------------------------------------------
8. HOME PAGE POLISH
--------------------------------------------------

Preserve the current Home page structure.

Keep:
- white brand header
- FixLens wordmark
- notification icon
- greeting
- Report an issue
- My Cases
- Other Questions
- Recent Case
- floating Chat button
- bottom navigation

Refine only visual details.

Make “Report an issue” remain clearly dominant.

Make My Cases and Other Questions feel secondary.

Refine the Recent Case card so it feels like a live case summary rather than just another generic card.

Possible subtle improvements:
- clearer title / status / update hierarchy
- slightly softer metadata
- more intentional spacing
- very subtle elevation if useful

Do not add more content to the Home page.

--------------------------------------------------
9. CASE DETAIL POLISH
--------------------------------------------------

Preserve the current information hierarchy:

- current status
- handled by
- your action
- what happens next
- progress
- latest activity
- submitted report

Make the current-state area visually stronger than the historical information.

Use subtle surface differences so the user immediately understands:
“What is happening now?”

Keep the timeline / history visually secondary.

Do not make the screen look like a dashboard full of boxes.

--------------------------------------------------
10. INBOX POLISH
--------------------------------------------------

Keep Inbox focused on “what changed”.

Refine notification hierarchy:

Unread / important:
- slightly stronger background or indicator

Read / informational:
- quieter

Action required:
- clear status indicator
- do not overuse red

Use consistent spacing and metadata styling.

--------------------------------------------------
11. PROFILE POLISH
--------------------------------------------------

Keep Profile simple.

Use clear section grouping without excessive cards.

Where possible:
- use section headers
- simple rows
- subtle separators

Avoid wrapping every individual setting in its own card.

Profile should feel lighter than Cases or Case Detail.

--------------------------------------------------
12. BOTTOM NAVIGATION
--------------------------------------------------

Keep the current four-tab bottom navigation:

- Home
- Cases
- Inbox
- Profile

Refine:
- icon sizing
- label spacing
- active/inactive colour contrast
- vertical alignment

Keep active state blue.

Inactive states should remain clearly visible but muted.

Do not add extra decoration.

--------------------------------------------------
13. FLOATING CHAT BUTTON
--------------------------------------------------

Keep the floating Chat button.

Refine it so it feels integrated with the design system.

Use:
- strong primary blue
- simple chat icon
- compact shadow
- consistent corner / circular geometry
- good spacing above bottom navigation

Do not make it oversized.

It should feel available but not compete with “Report an issue”.

--------------------------------------------------
14. MICRO-INTERACTIONS
--------------------------------------------------

Add only subtle, purposeful motion where appropriate.

Examples:
- button press feedback
- card press feedback
- floating Chat button press state
- chat message fade / slide in
- capture guidance tip fade in and out
- status pill transition
- accordion expand / collapse
- modal / bottom-sheet transition

Keep motion fast and restrained.

Do not add decorative animations.

The app should still feel efficient.

--------------------------------------------------
15. ACCESSIBILITY / READABILITY
--------------------------------------------------

Check:
- text contrast
- minimum touch target size
- readable metadata
- clear button states
- consistent icon size
- visible selected / active states

Do not reduce text contrast too far in the name of minimalism.

--------------------------------------------------
16. FINAL VISUAL GOAL
--------------------------------------------------

The prototype should feel:

- minimal
- trustworthy
- calm
- modern
- professional
- slightly premium
- realistic enough to feel like a production-ready service app

It should NOT feel:
- experimental
- playful
- futuristic
- decorative
- like a generic UI kit

The final result should look like the same FixLens product, just more refined and mature.

Do not change functionality or user flows unless necessary to fix a visual inconsistency.