// Checks the instructor PIN for the locked test.
// Set the PIN in Netlify: Project configuration -> Environment variables -> TEST_PIN
// After changing it, trigger a redeploy so the function picks it up.
export default async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  let body = {};
  try { body = await req.json(); } catch {}
  const expected = String(process.env.TEST_PIN || '').trim();
  const pin = String(body.pin || '').trim();
  const ok = expected.length > 0 && pin === expected;
  if (!ok) await new Promise(r => setTimeout(r, 900)); // slow down guessing
  return new Response(JSON.stringify({ ok }), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
  });
};
