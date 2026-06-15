import type { APIRoute } from 'astro';
import { getSettings, getTiers } from '../../lib/content';

export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Partner pricing gate.
 *
 * POST { email, returning? } →
 *   - validates the email format
 *   - on a first unlock (returning falsy), forwards the captured lead to the
 *     owner via FORGE_LEAD_WEBHOOK (Formspree / Basin / own endpoint). If no
 *     webhook is configured the lead is logged server-side so it is never lost.
 *   - returns the tier data + pricing footnote (deliberately NOT prerendered,
 *     so partner pricing never appears in the crawlable HTML).
 */
export const POST: APIRoute = async ({ request }) => {
  let body: { email?: string; returning?: boolean };
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'Invalid request.' }, 400);
  }

  const email = (body.email ?? '').trim();
  if (!EMAIL_RE.test(email)) {
    return json(
      { ok: false, error: 'That does not look like an email address. One more try?' },
      422
    );
  }

  // Forward the lead on a fresh unlock only.
  if (!body.returning) {
    await forwardLead(email, request);
  }

  const [tiers, settings] = await Promise.all([getTiers(), getSettings()]);
  return json({
    ok: true,
    email,
    tiers,
    footnote: settings.pricing?.footnote ?? '',
    contactEmail: settings.site?.contactEmail ?? 'hello@weforgepartnerships.com',
  });
};

async function forwardLead(email: string, request: Request) {
  const webhook = import.meta.env.FORGE_LEAD_WEBHOOK || process.env.FORGE_LEAD_WEBHOOK;
  const payload = {
    email,
    source: 'Partner pricing gate · The Forge',
    page: '/partners',
    timestamp: new Date().toISOString(),
    userAgent: request.headers.get('user-agent') ?? '',
  };

  if (!webhook) {
    // No service wired yet — make sure the lead is still captured in the logs.
    console.log('[forge:lead]', JSON.stringify(payload));
    return;
  }

  try {
    await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    // Never block the unlock on a delivery failure; log so it can be recovered.
    console.error('[forge:lead] delivery failed', err, JSON.stringify(payload));
  }
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}
