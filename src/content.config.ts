import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

// ---------------------------------------------------------------------------
// Content collections — everything the (non-technical) owner can edit.
// Layout and design are hard-coded; only the content below is data-driven.
// The Decap CMS at /admin writes to these same files, so the shapes here and
// in public/admin/config.yml must stay in step.
//
// Photos are stored as site-root paths (e.g. "/assets/uploads/foo.jpg") so
// they line up with how Decap saves media. The design crops every photo with
// object-fit: cover at a fixed box, so no build-time resizing is required.
// ---------------------------------------------------------------------------

// Members — the founding-member carousel on the Brands page.
const members = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/members' }),
  schema: z.object({
    brand: z.string(),
    person: z.string(), // founder line, e.g. "Frances, founder"
    line: z.string(), // lowercase serif one-liner
    place: z.string(), // location chip
    initials: z.string(), // shown on the "photo on its way" placeholder
    photo: z.string().optional(), // optional — placeholder shows when empty
    order: z.number().default(0),
    published: z.boolean().default(true),
  }),
});

// Partner tiers — the email-gated pricing on the Partners page.
// This data is served only from the /api/unlock endpoint, never prerendered.
const tiers = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/tiers' }),
  schema: z.object({
    name: z.string(),
    price: z.string(),
    priceNote: z.string(),
    features: z.array(z.string()),
    highlight: z.boolean().default(false),
    badge: z.string().optional(),
    order: z.number().default(0),
  }),
});

// Singletons — small site-wide settings, edited as individual records.
const settings = defineCollection({
  loader: file('./src/content/settings/index.json', {
    parser: (text) => {
      const data = JSON.parse(text);
      return Object.entries(data).map(([id, value]) => ({ id, ...(value as object) }));
    },
  }),
  schema: z.object({
    id: z.string(),
    // site
    contactEmail: z.string().optional(),
    launchDate: z.string().optional(),
    location: z.string().optional(),
    dinnerHostCredit: z.string().optional(),
    // dinner
    when: z.string().optional(),
    where: z.string().optional(),
    covers: z.string().optional(),
    // founder (Behind it)
    bio: z.string().optional(),
    portrait: z.string().optional(),
    // member criteria (shape of a member)
    revenue: z.string().optional(),
    trading: z.string().optional(),
    runBy: z.string().optional(),
    capLine: z.string().optional(),
    // pricing footnote
    footnote: z.string().optional(),
  }),
});

export const collections = { members, tiers, settings };
