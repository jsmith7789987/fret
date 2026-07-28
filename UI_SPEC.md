# fret. UI Specification

Version 2, replacing the design notes in Section 9 of `PROJECT_BRIEF.md`.
Where this file and Section 9 disagree, this file wins, and Section 9 should be
updated to point here.

Reference point: JamesEdition. Image led category tiles, a two tier header, a
white ground, serif display type over sans meta type, and a lot of air.

---

## 1. Colour

### Tokens

| Token | Hex | Use |
|---|---|---|
| `canvas` | `#FFFFFF` | Page ground. The default for everything. |
| `sand` | `#F8F7F5` | Quiet band used to separate full width sections on a white page. Never a card. |
| `ink` | `#111110` | Body text, headings, and any type that is not a link. |
| `muted` | `#6B6860` | Secondary text, labels, captions, meta. |
| `hairline` | `#E5E4E0` | All borders and rules. Always 0.5px. |
| `action` | `#224FF1` | Every control. See the rule below. |
| `action-hover` | `#1B3FC4` | Hover and pressed state for filled action surfaces. |
| `action-soft` | `#EEF2FE` | Tinted background for a selected or hovered action card. |
| `action-border` | `#C3D0FB` | Border on a soft action surface. |
| `match` | `#C17A2A` | Match signal only. |
| `match-bg` | `#FEF6EC` | Match badge and alert bar background. |
| `match-border` | `#F0C88A` | Match badge and alert bar border. |
| `match-text` | `#7A4F10` | Text on a match surface. |

### The two accent rule

This is the one colour rule that matters, and it is what keeps the palette from
turning to mud.

**Blue means you can act on this.** Buttons, links, filter chips, focus rings,
the logo dot, hover states, the arrow on a category tile, the selected state of
any control.

**Amber means this matched you.** The match badge and the alert bar at the top
of browse. Nothing else. Amber is never a button, never a link, never a hover
state. If a person cannot click it, and it is not a match signal, it is ink or
muted.

Amber is also used for the wear summary panel on a listing, which is a signal
rather than a control. That is the only exception and it should not grow.

---

## 2. Type

| Role | Face | Size | Notes |
|---|---|---|---|
| Page display | DM Serif Display | 44px, 60px at `sm` | Home hero only. Tight leading, `1.06`. |
| Section heading | DM Serif Display | 34px, 40px at `sm` | "Featured categories". |
| Card and tile title | DM Serif Display | 26px | Category tiles, fork cards, listing titles. |
| Subsection heading | DM Serif Display | 22px | Value props, panel headings. |
| Listing title in a grid | DM Serif Display | 15px to 18px | Small, still serif. |
| Body | Inter | 14px to 16px | `leading-relaxed` on any paragraph over one line. |
| UI and nav | Inter | 14px | Header links, buttons, form labels. |
| Meta and caption | Inter | 11px to 13px | Muted. |
| Eyebrow and overline | Inter | 11px, uppercase, `tracking-[0.12em]` | Above a title, or under a tile title. |

Serif is for names and headings. Sans is for everything a person operates.
Never set body copy in the serif.

---

## 3. Layout

- Content shell is `max-w-shell`, 1680px, with `px-5` and `px-8` from `lg`.
- Section rhythm is `py-16` and `py-20` from `lg`. Hero is `py-20` and `py-28`.
- Full width bands alternate `canvas` and `sand` and are separated by a 0.5px
  `hairline` rule, never by a shadow or a gap.
- Grids: category tiles are 1 column, 2 at `sm`, 4 at `lg`, gap 20px. Listing
  cards stay on `repeat(auto-fit, minmax(180px, 1fr))` with a 16px gap.

---

## 4. Header

Two tiers, sticky, white, each tier closed by a 0.5px hairline.

**Row one**, 64px tall:
- Hamburger at the far left, always visible, opens the full menu panel.
- Wordmark `fret.` in DM Serif Display at 26px. The period is `action` blue.
- Right side: "Sell a guitar", "For dealers", then the account control.
- The account control is a pill with a 1px `action` border, `action` text, and
  a user icon. On hover it fills `action` with white text. It reads
  "Log in or sign up" when signed out and becomes the Clerk user button when
  signed in.

**Row two**, 48px tall, the category rail:
- Plain 14px ink links, 28px apart, hover to `action`.
- Scrolls horizontally on narrow screens. It never collapses, because the
  categories are the primary way into inventory.
- Hidden on focused surfaces such as sell, onboarding, and the dashboards, by
  passing `showCategories={false}`.

---

## 5. Category tile

The signature element of the home page.

- Portrait, `aspect-[3/4]`, `rounded-tile` at 4px, no border, no shadow.
- Image fills the tile and scales to `1.03` over 500ms on hover.
- A scrim runs from `black/75` at the foot through `black/15` to transparent,
  so white type stays readable over any photograph.
- Title in DM Serif Display 26px, white, at the bottom left.
- Under the title, an 11px uppercase `tracking-[0.12em]` line at `white/75`
  carrying the listing count, or the word "Browse" when the count is zero.
- An arrow at the bottom right, white, translating 4px right on hover.
- Until a category has a photograph it renders a two stop CSS gradient defined
  on the category itself. Nothing is fetched over the network for the fallback.

**This element needs real photography to work.** The gradients are honest
placeholders, not a finished look. Four strong images will do more for this
page than any amount of further code.

---

## 6. Components

**Buttons.** 6px radius, 13px, medium weight.
- Primary: `action` fill, white text, `action-hover` on hover.
- Secondary: white fill, ink text, hairline border, border and text go `action`
  on hover.
- Ghost: muted text, `action` on hover.

**Filter chips.** Full radius pill, 13px, 14px horizontal padding. Inactive is
white with a hairline border and ink text. Active is `action` fill with white
text. Hover on an inactive chip moves the border and text to `action`.

**Cards.** 10px radius, 0.5px hairline border, white fill. No shadow.

**Fork cards.** The two paths on the home page. 10px radius, 28px padding. The
recommended path carries an `action` border and tints `action-soft` on hover.
The other carries a hairline border that becomes `action` on hover. Each ends
with a blue text link and an arrow that translates on hover.

**Match badge.** Pill, `match-bg` fill, `match-text` text, `match-border` ring,
11px. Reads "XX% match". Shown when the score clears the threshold.

**Alert bar.** Full width panel at the top of browse, `match-bg` fill,
`match-border` border, `match-text` text, a small amber dot, and an arrow at
the right.

**Inputs.** `.fret-input` in `globals.css`. Full width, 10px radius, 0.5px
hairline border, white fill, 14px. Border goes `action` on focus.

**Focus.** No shadows anywhere except focus. Focus is a 2px white spacer ring
plus a 2px `action` ring, at 6px radius.

---

## 7. Motion

Restrained and short.
- Colour transitions: `transition-colors`, default duration.
- Tile image scale: 500ms.
- Arrow translate: 300ms, 4px.
- `fadeUp`: 350ms, used when a step in a flow changes.
- `pulseDot`: 1.2s loop, used only by the voice input recording indicator.

Nothing bounces. Nothing slides in on scroll.

---

## 8. Copy

- Plain and direct. No filler.
- No em dashes anywhere, in UI copy or code comments. Use a comma, a full stop,
  or a colon.
- Sentence case for headings. Uppercase only for eyebrows and overlines.
- Say what a thing is, not how excited you are about it.
- Never present an AI estimate as a fact. Fair market figures are labelled
  estimates, in the footer and at every point of use.

---

## 9. What is built and what is not

Built to this spec: design tokens, the two tier header, the mobile menu panel,
the site footer, the home page including the fork and the featured category
tiles, buttons, and filter chips.

Not yet restyled, still carrying the older look under the new tokens: browse,
listing detail, the seller flow, onboarding, and the dashboards. They pick up
the new colours and header automatically but their layouts have not been
reworked to this reference.

Needed from you: photography for the category tiles, and a decision on whether
listing cards move to the same portrait, image led treatment as the tiles.
