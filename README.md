# FSIA Model Gallery

A redesign of the FSIA model gallery that wires **profile navigation** directly to **portfolio photos**.
Selecting a model's tab immediately swaps the photo grid beneath it — no page change, no separate
gallery route — and the model's name, title and city stay pinned while you browse.

React 19 · Vite 7 · Tailwind CSS 4 · Framer Motion 13

---

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle in dist/
npm run preview  # serve the built bundle
npm run lint
```

## How the connection works

One piece of state decides everything. `ModelGallery` holds `activeModelId`; the tab list and the
photo grid both read from it, so the two halves can never disagree.

```jsx
// src/components/ModelGallery.jsx
const visibleModels = modelsInCategory(activeCategory)
const selectedModel =
  visibleModels.find((model) => model.id === activeModelId) ?? visibleModels[0] ?? null
```

`selectedModel` is **derived, never stored**. Two consequences worth knowing:

- Changing category doesn't clear your selection — if the active model isn't in the new category the
  grid falls back to the first one on screen, and returning to *All Models* restores what you had.
- There's no effect syncing tab state to grid state, so there's no window where they disagree.

`PhotoGrid` keys its container on `model.id`. That makes a tab change a genuine unmount/mount, which
is what lets `AnimatePresence mode="wait"` play the outgoing portfolio out before staggering the new
one in.

## Layout

| Breakpoint | Profile navigation | Gallery |
| --- | --- | --- |
| `< 1024px` | horizontal snap-scrolling tab strip above the content | 2-column masonry |
| `≥ 1024px` | sticky vertical rail, 19rem, independently scrollable | 3-column masonry (4 at 2xl) |

Orientation comes from `useMediaQuery('(min-width: 1024px)')` and only one `ProfileTabs` instance is
ever mounted, so tab `id`s stay unique.

## Interaction and accessibility

- **Tabs** follow the WAI-ARIA tabs pattern: `role="tablist"` with roving `tabindex`, arrow keys
  (axis follows orientation), `Home`/`End`, and `aria-controls` pointing at the gallery panel.
- **Lightbox** is a modal dialog — focus moves in on open, `Tab` is trapped, `Esc` closes and focus
  returns to the exact tile you opened. `←`/`→` step through, and the frame is draggable for swipe on
  touch. Neighbouring frames are preloaded so arrow-key browsing doesn't flash.
- **Persistent profile info** appears in both places: pinned above the grid, and in the lightbox
  header, so you never lose track of whose portfolio you're inside.
- **Motion** respects `prefers-reduced-motion` — Framer Motion variants collapse to plain fades via
  `useReducedMotion`, and CSS transitions are neutralised in `index.css`.
- **Deep links**: the selected profile is mirrored to the URL hash (`/#ishita-rao`) with
  `replaceState`, so a profile can be shared without polluting browser history.

## Data

`src/data/models.js` is the mock roster. One record:

```js
{
  id: 'm-02',
  slug: 'ishita-rao',          // URL fragment
  name: 'Ishita Rao',
  title: 'Forever Mrs India',
  category: 'mrs',             // one of CATEGORIES[].id
  city: 'Bengaluru',
  state: 'Karnataka',
  crownYear: 2024,
  verified: true,
  tagline: 'Silk weaves, heritage jewellery, campaign work.',
  photos: [
    { id: 'ishita-rao-01', src: 'models/ishita-rao/01', aspect: 0.72, caption: null },
    // ...
  ],
}
```

`aspect` is width ÷ height. Varying it per photo is what gives the masonry its editorial rhythm, and
it also reserves the right box before the image arrives, so the grid doesn't reflow while loading.

### Swapping in a real backend

Every component takes models as props and none of them import a data client, so replacing the mock is
a one-file change. With Supabase:

```js
const { data } = await supabase
  .from('models')
  .select('id, slug, name, title, category, city, state, crown_year, verified, tagline, photos(*)')
  .order('crown_year', { ascending: false })
```

Map the rows to the shape above and hand them to `ModelGallery` — nothing else moves.

## Images

`src/lib/images.js` is the only place that knows where photos live. It has three tiers:

1. **ImageKit** — set `VITE_IMAGEKIT_URL` (see `.env.example`) and `photo.src` is treated as an
   ImageKit path, rendered with `w`/`h`/`q-78`/`f-auto` transforms and a full `srcset`.
2. **Seeded placeholders** — with no CDN configured, `picsum.photos` stands in so the gallery is
   browsable before any assets exist.
3. **Branded fallback** — if a remote photo fails to load at all, `SmartImage` swaps in a generated
   SVG frame in the FSIA palette. A dead CDN degrades to a dark gold card, never a torn-image icon.

Tiles are `loading="lazy"`, fade up from a blur once decoded, and ship a `sizes` hint matching the
responsive column count so the browser fetches the smallest file that fills the slot.

## Design tokens

The gold / black / bone palette, both typefaces, and the shared easing curve are declared once as
Tailwind v4 `@theme` tokens at the top of `src/index.css`. Tailwind derives the utilities from them
(`--color-gold-500` → `text-gold-500`, `bg-gold-500`, `ring-gold-500`, …), so re-skinning the whole
surface means editing that block and nothing else.

## Files

```
src/
├── App.jsx                     page shell — header, hero, footer
├── index.css                   design tokens + base layer
├── components/
│   ├── ModelGallery.jsx        state owner; wires tabs to grid
│   ├── CategoryFilter.jsx      All / Miss / Mrs / Teen / Mr
│   ├── ProfileTabs.jsx         ARIA tablist, vertical or horizontal
│   ├── ProfileHeader.jsx       persistent name / title / city
│   ├── PhotoGrid.jsx           masonry + staggered swap animation
│   ├── PhotoCard.jsx           one tile
│   ├── Lightbox.jsx            modal viewer, filmstrip, keyboard + swipe
│   ├── SmartImage.jsx          responsive img with fallback
│   └── Icons.jsx
├── data/models.js              mock roster + category helpers
├── hooks/
│   ├── useBodyScrollLock.js
│   └── useMediaQuery.js
└── lib/images.js               CDN URL + srcset builder
```

Portfolio imagery in this repository is placeholder photography for demonstration only.
