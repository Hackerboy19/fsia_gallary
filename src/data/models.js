/**
 * Mock FSIA roster.
 *
 * Shape of a model record:
 *   id        stable key used by the tab <-> gallery wiring
 *   slug      URL fragment, so a profile can be linked to directly
 *   name      display name
 *   title     full FSIA title, shown in the persistent profile header
 *   category  one of CATEGORIES[].id — drives the top-level filter
 *   city      /  state — shown alongside the title
 *   crownYear year the title was awarded
 *   verified  true for FSIA-verified contestants
 *   tagline   one line of editorial copy
 *   photos    the portfolio; see `portfolio()` below
 *
 * Swap this file for a Supabase query (or any REST call) that returns the same
 * shape and every component below keeps working unchanged.
 */

export const CATEGORIES = [
  { id: 'all', label: 'All Models' },
  { id: 'miss', label: 'Miss' },
  { id: 'mrs', label: 'Mrs' },
  { id: 'teen', label: 'Teen' },
  { id: 'mr', label: 'Mr' },
]

/**
 * Aspect ratios cycle through this pool so a portfolio reads like an editorial
 * spread rather than a uniform contact sheet.
 */
const ASPECTS = [0.72, 0.8, 1, 0.667, 1.5, 0.75, 0.833, 1.333]

/**
 * Builds a portfolio of `count` photos for a model.
 * @param {string} slug
 * @param {number} count
 * @param {Record<number, string>} [captions] 1-indexed captions
 */
function portfolio(slug, count, captions = {}) {
  return Array.from({ length: count }, (_, index) => {
    const n = String(index + 1).padStart(2, '0')
    return {
      id: `${slug}-${n}`,
      src: `models/${slug}/${n}`,
      aspect: ASPECTS[(index * 3) % ASPECTS.length],
      caption: captions[index + 1] ?? null,
    }
  })
}

export const MODELS = [
  {
    id: 'm-01',
    slug: 'aanya-sharma',
    name: 'Aanya Sharma',
    title: 'Forever Miss India',
    category: 'miss',
    city: 'Mumbai',
    state: 'Maharashtra',
    crownYear: 2024,
    verified: true,
    tagline: 'Couture editorial and runway. Trained classical dancer.',
    photos: portfolio('aanya-sharma', 9, {
      1: 'Crowning night — Grand Finale, Mumbai',
      4: 'Ivory drape, studio series',
      7: 'Backstage, Resort ’24',
    }),
  },
  {
    id: 'm-02',
    slug: 'ishita-rao',
    name: 'Ishita Rao',
    title: 'Forever Mrs India',
    category: 'mrs',
    city: 'Bengaluru',
    state: 'Karnataka',
    crownYear: 2024,
    verified: true,
    tagline: 'Silk weaves, heritage jewellery, campaign work.',
    photos: portfolio('ishita-rao', 8, {
      2: 'Kanjivaram revival campaign',
      5: 'Golden hour, Lalbagh',
    }),
  },
  {
    id: 'm-03',
    slug: 'meher-kapoor',
    name: 'Meher Kapoor',
    title: 'Forever Miss India · 1st Runner-Up',
    category: 'miss',
    city: 'New Delhi',
    state: 'Delhi',
    crownYear: 2023,
    verified: true,
    tagline: 'High-fashion beauty and skincare campaigns.',
    photos: portfolio('meher-kapoor', 10, {
      1: 'Beauty close-up, gold leaf',
      6: 'Monochrome portfolio series',
    }),
  },
  {
    id: 'm-04',
    slug: 'raghav-menon',
    name: 'Raghav Menon',
    title: 'Forever Mr India',
    category: 'mr',
    city: 'Kochi',
    state: 'Kerala',
    crownYear: 2024,
    verified: true,
    tagline: 'Menswear tailoring, fitness and lifestyle editorials.',
    photos: portfolio('raghav-menon', 7, {
      3: 'Bespoke tailoring lookbook',
    }),
  },
  {
    id: 'm-05',
    slug: 'tara-nair',
    name: 'Tara Nair',
    title: 'Forever Teen India',
    category: 'teen',
    city: 'Chennai',
    state: 'Tamil Nadu',
    crownYear: 2025,
    verified: true,
    tagline: 'Youngest titleholder of the season. Editorial newcomer.',
    photos: portfolio('tara-nair', 8, {
      2: 'First cover, Teen edition',
    }),
  },
  {
    id: 'm-06',
    slug: 'simran-bedi',
    name: 'Simran Bedi',
    title: 'Forever Mrs India · Classic',
    category: 'mrs',
    city: 'Chandigarh',
    state: 'Punjab',
    crownYear: 2023,
    verified: true,
    tagline: 'Bridal couture, jewellery and lifestyle features.',
    photos: portfolio('simran-bedi', 9, {
      1: 'Bridal couture, Phulkari series',
      8: 'Evening gown, gold on black',
    }),
  },
  {
    id: 'm-07',
    slug: 'zoya-khan',
    name: 'Zoya Khan',
    title: 'Verified Contestant',
    category: 'miss',
    city: 'Hyderabad',
    state: 'Telangana',
    crownYear: 2025,
    verified: true,
    tagline: 'Ramp and print. Represented at three national showcases.',
    photos: portfolio('zoya-khan', 6),
  },
  {
    id: 'm-08',
    slug: 'devika-joshi',
    name: 'Devika Joshi',
    title: 'Forever Teen India · 2nd Runner-Up',
    category: 'teen',
    city: 'Pune',
    state: 'Maharashtra',
    crownYear: 2024,
    verified: false,
    tagline: 'Street-cast newcomer with a growing print portfolio.',
    photos: portfolio('devika-joshi', 7),
  },
  {
    id: 'm-09',
    slug: 'arjun-thakur',
    name: 'Arjun Thakur',
    title: 'Forever Mr India · Runner-Up',
    category: 'mr',
    city: 'Jaipur',
    state: 'Rajasthan',
    crownYear: 2023,
    verified: true,
    tagline: 'Heritage menswear, sherwani and festive campaigns.',
    photos: portfolio('arjun-thakur', 8, {
      4: 'Amber Fort, festive campaign',
    }),
  },
  {
    id: 'm-10',
    slug: 'nandini-das',
    name: 'Nandini Das',
    title: 'Forever Mrs India · Elite',
    category: 'mrs',
    city: 'Kolkata',
    state: 'West Bengal',
    crownYear: 2025,
    verified: true,
    tagline: 'Handloom advocacy, editorial and brand ambassadorship.',
    photos: portfolio('nandini-das', 9, {
      3: 'Handloom revival, Shantiniketan',
    }),
  },
]

/** @param {string} categoryId */
export function modelsInCategory(categoryId) {
  return categoryId === 'all' ? MODELS : MODELS.filter((model) => model.category === categoryId)
}
