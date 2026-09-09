# VOID UI Refactor Specification

> **Document purpose:** Master specification for AI Agents implementing the frontend refactor of VOID Downloader.
>
> **Scope:** Frontend UI/UX architecture, visual system, responsive behavior, interaction states, and component refactor.
>
> **Out of scope:** YouTube/X backend implementation, downloader extraction logic, cookies handling, API redesign, deployment, authentication, analytics, and unrelated backend refactors.

---

## 1. Mission

Refactor the current VOID Downloader frontend into a polished **VOID Brutalist 2.0** interface.

The design must preserve VOID's existing brutalist identity while making the product feel more premium, deliberate, readable, and production-ready.

VOID should look like a **serious developer/media utility**, not like a generic free downloader website.

The final experience should support these platforms without creating separate visual systems for each one:

- YouTube
- TikTok
- Instagram
- X / Twitter

The UI must be designed as a **universal media downloader** from the beginning. Platform-specific differences belong in data and rendering capabilities, not in duplicated page layouts.

---

## 2. Critical Instructions for AI Agents

### 2.1 Read these files before changing code

Before implementation, inspect:

- `AGENT.md`
- `DESIGN.md`
- `PLAN.md`
- `PLAN_REDESIGN.md`
- `README.md`
- current frontend source under `frontend/src`

Do not assume the old UI architecture is the final architecture.

### 2.2 Do not implement blindly

Before editing components:

1. Inspect the current component tree.
2. Inspect existing API response handling.
3. Identify reusable components.
4. Identify components that are too platform-specific.
5. Identify styling duplication.
6. Produce a short implementation plan.
7. Then implement incrementally.

Do not rewrite the entire frontend in one uncontrolled change.

### 2.3 Preserve working functionality

The refactor must not break existing TikTok and Instagram functionality.

The current `/api/download` contract must remain compatible unless a separate backend task explicitly changes it.

Do not modify backend services merely to make the new UI easier to implement.

### 2.4 No feature creep

Do NOT add:

- authentication
- accounts
- database-backed history
- payments
- advertisements
- browser extensions
- admin dashboard
- unrelated settings
- social login
- unnecessary animations

The goal is a better downloader UI, not a complete SaaS platform.

---

# 3. Product Direction

## 3.1 Design concept

**VOID Brutalist 2.0**

Keywords:

- brutalist
- editorial
- technical
- monochrome
- sharp
- high contrast
- industrial
- premium utility
- developer tool
- minimal but expressive

The interface should feel like a combination of:

- technical documentation
- modern editorial design
- developer tooling
- industrial interface design
- premium media utility

It must NOT feel like:

- generic SaaS template
- crypto dashboard
- gaming UI
- glassmorphism landing page
- neon cyberpunk website
- advertisement-heavy downloader
- overly playful consumer app

---

# 4. Core Design Principle

## Utility first, identity second, decoration last

Every visual element must have a purpose.

If an element does not improve:

- hierarchy
- navigation
- understanding
- feedback
- interaction

remove it.

VOID should be visually distinctive because of its typography, spacing, grid, hierarchy, and composition, not because of excessive decorative effects.

---

# 5. Visual System

## 5.1 Primary palette

Use a strict monochrome palette.

```text
Background       #000000
Primary text     #FFFFFF
Secondary text   #A1A1AA
Muted text       #71717A
Divider          #3F3F46
Soft surface     #09090B
Input surface    #050505
Error            #EF4444
```

Do not introduce random colors.

Platform brand colors should NOT become the primary UI palette.

If platform identification needs visual differentiation, use:

- text labels
- Lucide icons where appropriate
- subtle structural markers
- platform abbreviations

Do not create four colorful platform cards.

## 5.2 Borders

Default border:

```text
1px or 2px
```

Use 3px borders only for major emphasis such as the primary URL input or important result container.

Do not add random border thicknesses.

## 5.3 Border radius

Default:

```text
0px
```

VOID is intentionally sharp.

Do not use rounded cards, pills, excessive rounded buttons, or modern soft SaaS containers.

A tiny radius may be introduced only if a browser/platform usability issue requires it. Prefer zero radius.

## 5.4 Shadows

Do not use conventional box shadows.

No:

- glowing shadows
- neon shadows
- soft floating cards
- glass shadows

The sense of depth must come from borders, spacing, scale, and contrast.

## 5.5 Gradients

Do not use gradients.

No background gradient.
No button gradient.
No text gradient.
No thumbnail gradient overlays unless required for media legibility.

---

# 6. Typography

Typography is one of the primary visual features of VOID.

## 6.1 Font roles

Use a strong sans-serif display font for large headlines and a monospace font for technical metadata.

Preferred concept:

```text
Display: Geist / Inter / Space Grotesk style
Technical: JetBrains Mono / IBM Plex Mono style
Body: clean sans-serif
```

Use whatever font infrastructure already exists in the project when practical. Do not add a heavy font dependency without a reason.

## 6.2 Display typography

Large headings should be bold, compact, and editorial.

Example:

```text
DOWNLOAD
WITHOUT
THE NOISE.
```

Avoid excessive letter spacing on large display text.

Recommended range:

```text
letter-spacing: -0.04em to -0.06em
```

## 6.3 Technical typography

Use monospace for:

- platform labels
- URL field labels
- status messages
- media format
- resolution
- file size
- timing
- version
- system status
- section indexes

Technical labels can use wider tracking, around:

```text
0.06em to 0.10em
```

## 6.4 Body text

Body text must remain readable.

Do not force monospace on every sentence merely for aesthetic consistency.

---

# 7. Layout System

## 7.1 Desktop container

Target content width:

```text
max-width: 1100px to 1200px
```

The current project used a narrower 860px layout. The new design may expand the visual canvas while keeping readable content widths inside individual sections.

Do not make the page full-width without structure.

## 7.2 Grid

Use a subtle technical grid or ruled background where appropriate.

The grid must be extremely subtle and must never compete with text.

Concept:

```text
┼────────┼────────┼────────┼────────┼
│        │        │        │        │
│        │        │        │        │
┼────────┼────────┼────────┼────────┼
```

If the grid hurts readability, reduce opacity or remove it from that section.

## 7.3 Spacing

Prefer generous vertical spacing.

The page should breathe.

Do not compress every section merely to fit more content above the fold.

---

# 8. Homepage Structure

The homepage should follow this conceptual structure:

```text
NAVBAR
   ↓
HERO
   ↓
URL INPUT
   ↓
SUPPORTED PLATFORMS
   ↓
RESULT AREA
   ↓
HOW IT WORKS / SMALL UTILITY INFO
   ↓
FOOTER
```

The result area should become the dominant content after a URL is analyzed.

Do not keep a huge hero permanently occupying the screen after results are available.

---

# 9. Navbar

Keep the navbar compact.

Concept:

```text
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│ V O I D                              DOCS  GITHUB  ● ONLINE  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

Requirements:

- VOID wordmark on the left.
- Minimal navigation on the right.
- Avoid oversized navbar height.
- Use monospace for technical navigation if appropriate.
- `ONLINE` can be represented by a small status indicator.
- No colorful logo treatment.

On mobile:

```text
VOID                                             [ MENU ]
```

Use a proper icon, not an emoji.

---

# 10. Hero

The hero must feel bold but not bloated.

Recommended structure:

```text
UNIVERSAL MEDIA DOWNLOADER                         [01]

VOID

DOWNLOAD
WITHOUT
THE NOISE.

────────────────────────────────────────────────────────

YouTube · TikTok · Instagram · X
```

The exact copy can be refined during implementation, but the hierarchy should remain.

## Hero rules

- `VOID` is visually dominant.
- Headline is large and editorial.
- Supporting text is small.
- Platform support is explicit but understated.
- Avoid a giant paragraph.
- Avoid marketing buzzwords.
- Avoid fake statistics.
- Avoid excessive CTA buttons.

---

# 11. URL Input

The URL input is the primary interaction and must receive the strongest UI attention after the hero.

Concept:

```text
INPUT SOURCE

┌──────────────────────────────────────────────────────────────┐
│ https://youtube.com/watch?v=...                              │
│                                                              │
│                                              [ ANALYZE ↗ ]   │
└──────────────────────────────────────────────────────────────┘

SUPPORTED
[YT] [TT] [IG] [X]
```

## Input requirements

- Large clickable area.
- High contrast.
- Clear focus state.
- Paste-friendly.
- Keyboard accessible.
- Submit with Enter.
- Analyze button must have clear disabled/loading state.
- Clipboard action may use a Lucide icon.
- Do not use emoji.

## Empty state

Placeholder:

```text
PASTE URL HERE_
```

or a similarly concise technical placeholder.

## Loading state

Do not use a large decorative spinner.

Use a compact technical state such as:

```text
ANALYZING...
```

with a restrained animation if necessary.

---

# 12. Platform Detection

The user should NOT have to choose a platform before pasting a URL.

Flow:

```text
PASTE URL
    ↓
ANALYZE
    ↓
DETECT PLATFORM
    ↓
FETCH MEDIA
    ↓
SHOW RESULT
```

Supported platform labels:

```text
YT  YouTube
TT  TikTok
IG  Instagram
X   X / Twitter
```

Platform identity is data, not a separate page.

---

# 13. Result Architecture

The existing `ResultCard` must be evaluated critically.

Do not create a giant component containing platform-specific branches such as:

```js
if (platform === 'youtube') ...
if (platform === 'instagram') ...
if (platform === 'tiktok') ...
if (platform === 'twitter') ...
```

Instead, prefer generic components with normalized data.

Recommended conceptual architecture:

```text
MediaResult
├── PlatformHeader
├── MediaPreview
├── MediaMetadata
├── MediaDescription
└── DownloadOptions
    └── DownloadOption
```

Platform-specific capabilities should be represented by data.

---

# 14. Result Header

Example:

```text
YOUTUBE                                      ANALYZED · 0.42s
```

or:

```text
X / TWITTER                                  ANALYZED · 0.31s
```

Requirements:

- platform label
- optional media type
- analysis status/time if available
- clear visual separation from media content

Do not overdecorate it with platform colors.

---

# 15. Media Preview

The preview should be visually strong but controlled.

Desktop can use a two-column composition:

```text
┌──────────────────────────┐  TITLE / METADATA
│                          │
│        PREVIEW           │  @username
│                          │  description
│                          │
└──────────────────────────┘  metadata
```

For portrait content such as TikTok/Reels, do not stretch the image into a wide rectangle.

Respect the source aspect ratio.

For landscape YouTube content, use a wider preview.

For X posts, allow tweet text and author metadata to sit naturally beside or below the media.

---

# 16. Media Metadata

Possible metadata:

- title
- author/username
- duration
- views if available
- caption/tweet text
- media type
- platform

Only show data actually returned by the backend.

Do not invent placeholders that look like real data.

Long titles and captions must truncate gracefully without breaking layout.

---

# 17. Download Options

This is one of the most important UI improvements.

Do NOT turn every download format into a large rounded card.

Use compact technical rows.

Example:

```text
DOWNLOAD OPTIONS

VIDEO
──────────────────────────────────────────────────────────────
2160p     MP4       48.2 MB                         [ DOWNLOAD ]
1440p     MP4       32.1 MB                         [ DOWNLOAD ]
1080p     MP4       18.7 MB                         [ DOWNLOAD ]
720p      MP4       11.4 MB                         [ DOWNLOAD ]

AUDIO
──────────────────────────────────────────────────────────────
MP3       320kbps    4.8 MB                         [ DOWNLOAD ]
M4A       128kbps    2.1 MB                         [ DOWNLOAD ]
```

## Option row rules

Each row should clearly communicate:

1. quality
2. format
3. file size if known
4. action

The entire row can have a subtle hover treatment.

Primary hover:

```text
background: white
text: black
```

No glow.

No bounce.

No excessive transition.

---

# 18. Platform-Specific Result Examples

## 18.1 YouTube

Potential structure:

```text
YOUTUBE

[ WIDE VIDEO PREVIEW ]

Title
Channel / author
Duration

VIDEO
2160p MP4
1440p MP4
1080p MP4
720p MP4
480p MP4

AUDIO
MP3
M4A
```

YouTube is expected to have the richest download-option interface.

Do not hardcode assumptions about which resolutions exist.

Render only returned options.

## 18.2 TikTok

Potential structure:

```text
TIKTOK

[ PORTRAIT PREVIEW ]

@username
Caption

MEDIA
HD MP4
SD MP4
AUDIO
```

## 18.3 Instagram

Potential structure:

```text
INSTAGRAM

[ PREVIEW ]

@username
Caption

MEDIA
AVAILABLE DOWNLOADS
```

Support content types such as:

- post
- reel
- story

without creating separate page designs.

## 18.4 X / Twitter

Potential structure:

```text
X / TWITTER

@username
Tweet text...

[ VIDEO / IMAGE PREVIEW ]

MEDIA
1280×720 MP4
854×480 MP4
640×360 MP4
```

X may contain multiple media items. The UI architecture must not assume one URL always maps to exactly one media file.

---

# 19. Multiple Media

The normalized frontend model should be able to represent:

```text
One post
├── image
├── image
├── video
└── image
```

or:

```text
One post
└── video
    ├── 1080p
    ├── 720p
    └── 480p
```

Do not design the component tree around the assumption that there is always exactly one thumbnail and one download button.

---

# 20. Loading, Error, and Empty States

These states are part of the design, not afterthoughts.

## Loading

Example:

```text
ANALYZING SOURCE...

[------------------------------------]
```

Keep animation subtle and short.

## Invalid URL

Example:

```text
ERROR / INVALID URL

The provided URL is not supported.
```

Use the existing error red only when necessary.

Do not turn the whole page red.

## Extraction failure

Example:

```text
ERROR / MEDIA UNAVAILABLE

The media could not be accessed or extracted.
```

Do not expose backend stack traces to users.

## No download options

Provide a clear explanation and a way to retry.

---

# 21. Interaction Design

## Buttons

Primary action:

```text
[ ANALYZE ↗ ]
```

Download:

```text
[ DOWNLOAD ↗ ]
```

Secondary:

```text
[ COPY ]
[ RESET ]
```

Use Lucide icons where they improve clarity.

Do not use emoji as icons.

## Hover

Use fast, restrained transitions.

Target:

```text
0ms to 120ms
```

Avoid slow easing.

## Focus

Keyboard focus must be visible.

Do not remove browser focus indicators without replacing them with a better accessible state.

## Disabled

Disabled buttons must visibly communicate that they cannot be used.

## Success

Download initiation can provide a compact status message.

Avoid intrusive toast systems unless the current architecture already needs them.

---

# 22. Motion

Motion is secondary.

Allowed:

- subtle hover inversion
- short opacity changes
- compact loading indicator
- result reveal

Avoid:

- parallax
- floating cards
- bouncing buttons
- long entrance animations
- excessive page transitions
- animated backgrounds
- infinite decorative animations

The product should feel fast.

---

# 23. Responsive Design

Mobile is not a collapsed desktop version.

It needs intentional composition.

## Desktop

Use:

```text
wide hero
large typography
side-by-side preview/metadata where appropriate
wide download rows
```

## Tablet

Reduce typography and spacing while retaining hierarchy.

## Mobile

Use:

```text
compact navbar
stacked hero
full-width URL input
stacked preview
stacked metadata
full-width download rows
```

Example:

```text
┌────────────────────────────┐
│ VOID                  [≡] │
├────────────────────────────┤
│                            │
│ DOWNLOAD                   │
│ WITHOUT                    │
│ THE NOISE.                 │
│                            │
│ ┌────────────────────────┐ │
│ │ PASTE URL HERE_        │ │
│ │                        │ │
│ │              ANALYZE ↗ │ │
│ └────────────────────────┘ │
│                            │
│ [YT] [TT] [IG] [X]         │
│                            │
└────────────────────────────┘
```

Minimum requirement: no horizontal overflow.

---

# 24. Accessibility

Implement at minimum:

- semantic HTML
- keyboard navigation
- visible focus state
- accessible button labels
- sufficient text contrast
- meaningful image `alt` text where applicable
- form labels or accessible names
- no interaction dependent only on color
- sensible heading hierarchy

Do not sacrifice accessibility for the brutalist aesthetic.

---

# 25. Component Architecture

The exact names may change after inspecting the current codebase, but the target architecture should resemble:

```text
frontend/src/
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx
│   │   └── Footer.jsx
│   ├── hero/
│   │   └── Hero.jsx
│   ├── downloader/
│   │   ├── UrlInput.jsx
│   │   ├── PlatformSupport.jsx
│   │   ├── AnalysisState.jsx
│   │   ├── MediaResult.jsx
│   │   ├── PlatformHeader.jsx
│   │   ├── MediaPreview.jsx
│   │   ├── MediaMetadata.jsx
│   │   ├── MediaDescription.jsx
│   │   ├── DownloadOptions.jsx
│   │   └── DownloadOption.jsx
│   └── feedback/
│       ├── ErrorState.jsx
│       └── LoadingState.jsx
├── hooks/
│   └── useDownloader.js
├── utils/
│   └── detectPlatform.js
└── App.jsx
```

Do not create this exact structure if it conflicts with a better existing structure. The principle is more important than the filenames.

---

# 26. Generic Data-Driven Rendering

The UI should be capable of rendering normalized results such as:

```js
{
  platform: 'youtube',
  type: 'video',
  title: 'Example title',
  author: 'Example channel',
  thumbnail: '...',
  description: '...',
  media: [
    {
      type: 'video',
      label: '1080p',
      format: 'mp4',
      size: '18.7 MB',
      url: '...'
    }
  ]
}
```

The current backend may return a simpler shape. Do not invent a backend migration as part of this UI task.

Create a small frontend normalization/adapter layer if necessary so the presentation components stay generic.

---

# 27. Do Not Create Platform-Specific UI Forks

Bad:

```text
YoutubeResultCard.jsx
TikTokResultCard.jsx
InstagramResultCard.jsx
TwitterResultCard.jsx
```

unless there is a genuinely unique interaction that cannot be represented through generic components.

Preferred:

```text
MediaResult.jsx
PlatformHeader.jsx
MediaPreview.jsx
DownloadOptions.jsx
```

with capability-driven rendering.

The goal is to make adding Reddit or Facebook later significantly easier.

---

# 28. Existing Design Rules That Remain

Keep the spirit of the existing `DESIGN.md`:

- monochrome-first
- high contrast
- no decorative gradients
- no excessive rounded corners
- no shadows
- no emoji
- Lucide icons are preferred
- functional elements only
- technical/editorial aesthetic
- restrained motion
- mobile-first thinking

However, this document intentionally supersedes overly rigid rules that hurt typography and hierarchy.

In particular:

**Do not force every piece of text to use monospace.**

Use typography strategically.

---

# 29. Content and Copy

The copy should be concise and confident.

Preferred tone:

```text
technical
confident
minimal
slightly raw
```

Avoid:

```text
Unlock the ultimate media experience!
Download your favorite content effortlessly!
The world's #1 downloader!
```

Do not make unverifiable marketing claims.

VOID should communicate utility rather than hype.

Potential copy direction:

```text
UNIVERSAL MEDIA DOWNLOADER

DOWNLOAD
WITHOUT
THE NOISE.
```

```text
INPUT SOURCE
```

```text
ANALYZE
```

```text
DOWNLOAD OPTIONS
```

```text
SYSTEM ONLINE
```

Copy can be refined as long as the same tone is preserved.

---

# 30. Security and Privacy UI

Do not expose:

- cookies
- cookie file paths
- backend environment variables
- yt-dlp command lines
- internal server paths
- stack traces

If privacy messaging is included, keep it factual.

Example:

```text
COOKIES AND EXTRACTION CREDENTIALS REMAIN SERVER-SIDE.
```

Only display this if it accurately reflects the implementation.

---

# 31. Performance

The refactor must not unnecessarily increase frontend bundle size.

Rules:

- reuse existing dependencies where possible
- avoid large UI libraries for simple components
- lazy-load heavy functionality only when justified
- avoid unnecessary rerenders
- do not autoplay remote media unless explicitly required
- use responsive image sizing
- avoid loading huge preview assets unnecessarily

---

# 32. Implementation Phases

## Phase 1: Audit

Inspect current frontend and document:

- current component tree
- duplicated styling
- state flow
- API handling
- existing responsive behavior
- reusable components
- components that should be replaced

Do not modify code yet.

## Phase 2: Design foundation

Implement:

- typography system
- color variables
- spacing variables if useful
- border system
- page container
- grid/background treatment
- button primitives
- common technical labels

## Phase 3: Shell

Implement:

- navbar
- hero
- footer
- responsive layout

## Phase 4: Downloader input

Refactor:

- URL input
- analyze action
- loading state
- validation/error state
- platform support indicator

## Phase 5: Result system

Refactor:

- result container
- platform header
- preview
- metadata
- download options
- download rows

## Phase 6: Platform compatibility

Verify the generic UI can render:

- TikTok
- Instagram
- YouTube-shaped results
- X/Twitter-shaped results

Do not require backend support for YouTube/X during pure UI implementation. Mock normalized data only for local visual verification, and clearly isolate/remove mock data before completion.

## Phase 7: Responsive and accessibility pass

Test:

- desktop
- tablet
- mobile
- keyboard navigation
- focus states
- long titles
- long captions
- missing thumbnails
- many download options
- no download options
- API errors

## Phase 8: Cleanup

Remove:

- dead components
- duplicated CSS
- obsolete styles
- temporary mock data
- console debugging
- unused dependencies if introduced by the refactor

---

# 33. Required Verification

Before declaring the UI refactor complete, verify:

### Functional

- Existing TikTok flow still works.
- Existing Instagram flow still works.
- Analyze button works.
- Enter submits the form.
- Download buttons retain their behavior.
- Errors are rendered correctly.
- Loading state is clear.

### Visual

- Hero has clear hierarchy.
- VOID branding is prominent.
- URL input is the primary interaction.
- Result area is visually stronger than the old card layout.
- Download rows are easy to scan.
- No excessive rounded UI.
- No gradients.
- No unnecessary shadows.
- No emoji.
- No random colors.
- No excessive animations.

### Responsive

- No horizontal scrolling.
- Input works on small screens.
- Result preview scales correctly.
- Download options remain usable.
- Long text does not break the layout.

### Accessibility

- Keyboard usable.
- Focus visible.
- Buttons have accessible names.
- Contrast is acceptable.
- Semantic headings are maintained.

---

# 34. Visual QA Checklist

Before finishing, inspect the application as a real user.

Ask:

1. Does this immediately look like VOID?
2. Does it look like a serious tool rather than a template?
3. Is the first action obvious within two seconds?
4. Is the URL input visually dominant?
5. Does the result feel like a media tool rather than a generic card?
6. Can I scan quality and format without thinking?
7. Does YouTube fit naturally without breaking the design?
8. Does X/Twitter fit naturally without looking like a special case?
9. Does TikTok still feel natural?
10. Does Instagram still feel natural?
11. Does the mobile layout feel intentionally designed?
12. Are there any decorative elements that do not serve a purpose?

If the answer to the first two questions is no, the implementation is not finished.

---

# 35. Important Anti-Patterns

Never implement these merely because they are currently popular:

```text
Glassmorphism
Neon gradients
Huge floating blobs
Excessive blur
Rounded-everything
Generic SaaS cards
Rainbow platform colors
Animated background particles
3D decorative objects
Excessive skeleton loaders
Huge marketing sections
```

VOID is intentionally different.

---

# 36. Final Target

The target experience should communicate this in a few seconds:

```text
VOID

A fast, technical, no-nonsense utility
for downloading media from the open web.
```

The user should be able to:

```text
PASTE URL
    ↓
ANALYZE
    ↓
SEE WHAT WAS FOUND
    ↓
CHOOSE QUALITY / FORMAT
    ↓
DOWNLOAD
```

Everything else is secondary.

---

# 37. Agent Completion Report

After implementation, the AI Agent must report:

1. Files created.
2. Files modified.
3. Components removed or replaced.
4. New component architecture.
5. Any API assumptions made.
6. Responsive behavior implemented.
7. Accessibility improvements.
8. Tests/checks executed.
9. Known limitations.
10. Confirmation that backend functionality was not unnecessarily changed.

Do not claim visual verification if the application was not actually run.

---

# 38. Non-Negotiable Summary

```text
KEEP:
- VOID identity
- brutalist foundation
- monochrome palette
- sharp edges
- technical/editorial feel
- simple downloader flow
- existing working functionality

IMPROVE:
- typography hierarchy
- spacing
- composition
- result presentation
- download option scanning
- responsive behavior
- accessibility
- component architecture

AVOID:
- generic SaaS design
- excessive cards
- rounded UI everywhere
- gradients
- neon colors
- glassmorphism
- unnecessary animation
- platform-specific duplicated layouts
- backend changes during UI-only work
```

**The implementation is successful only when the new UI feels like a natural evolution of VOID, not a completely unrelated template.**
