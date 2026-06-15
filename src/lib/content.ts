import { getCollection } from 'astro:content';

// Settings are stored as one record per section ("site", "dinner", …).
// This flattens them into a single keyed object for easy use in templates.
export async function getSettings() {
  const entries = await getCollection('settings');
  const byId: Record<string, any> = {};
  for (const entry of entries) byId[entry.id] = entry.data;
  return {
    site: byId.site ?? {},
    dinner: byId.dinner ?? {},
    founder: byId.founder ?? {},
    criteria: byId.criteria ?? {},
    pricing: byId.pricing ?? {},
  };
}

// Published members, sorted by the owner-controlled display order.
export async function getMembers() {
  const members = await getCollection('members', ({ data }) => data.published !== false);
  return members
    .map((m) => m.data)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

// Partner tiers, sorted by display order. Used server-side only.
export async function getTiers() {
  const tiers = await getCollection('tiers');
  return tiers
    .map((t) => t.data)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}
