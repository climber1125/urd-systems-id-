// Runs automatically every time a test result is submitted (Netlify Forms event).
// Sends a phone push notification through ntfy.sh to the topic in NTFY_TOPIC.
export const handler = async (event) => {
  try {
    const { payload } = JSON.parse(event.body || '{}');
    if (!payload || payload.form_name !== 'test-results') return { statusCode: 200, body: 'skip' };
    const topic = process.env.NTFY_TOPIC;
    if (!topic) return { statusCode: 200, body: 'no topic' };
    const d = payload.data || {};
    const pass = String(d.result || '').toUpperCase() === 'PASS';
    const title = `${pass ? 'PASS' : 'FAIL'}: ${d.student || 'Unknown'} - ${d.board || 'Test'}`;
    const lines = [
      `Score: ${d.score || '?'} (${d.percent || '?'})`,
      `Time: ${d.minutes || '?'} min`,
      `${d.unlocked || 'PIN status unknown'}`,
      `Missed: ${d.missed || 'none'}`,
      `Check code: ${d['check-code'] || '-'}`
    ];
    await fetch(`https://ntfy.sh/${encodeURIComponent(topic)}`, {
      method: 'POST',
      headers: {
        Title: title,
        Tags: pass ? 'white_check_mark' : 'x',
        Priority: pass ? 'default' : 'high'
      },
      body: lines.join('\n')
    });
    return { statusCode: 200, body: 'sent' };
  } catch (e) {
    console.error('notify failed', e);
    return { statusCode: 200, body: 'error' };
  }
};
