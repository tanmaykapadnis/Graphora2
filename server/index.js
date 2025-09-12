const express = require('express');
// at top of file, after express import:
const cors = require('cors');
const app = express();
app.use(cors());                       // allow browser to call this server
app.use(express.json({ limit: '1mb' })); // parse JSON bodies


const PORT = 4000;


// fetch + readability imports
const fetchFunc = (typeof fetch === 'function')
  ? fetch
  : (...args) => import('node-fetch').then(m => m.default(...args));
const { JSDOM } = require('jsdom');
const { Readability } = require('@mozilla/readability');

app.get('/', (req, res) => {
  res.send('Server running');
});

// helper function
async function fetchArticleText(url) {
  const resp = await fetchFunc(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await resp.text();
  const dom = new JSDOM(html, { url });
  const article = new Readability(dom.window.document).parse();
  return article?.textContent?.trim() || article?.excerpt?.trim() || '';
}

// NEW route
app.get('/test-extract', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).send('Provide ?url=...');

    const text = await fetchArticleText(url);
    res.json({
      ok: true,
      snippet: text.slice(0, 500)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});
app.post('/api/generate', async (req, res) => {
  try {
    const { url, text } = req.body || {};

    // 1) if no text but url provided, fetch the article text
    let articleText = text;
    if (!articleText && url) {
      articleText = await fetchArticleText(url);
    }

    if (!articleText || articleText.trim().length === 0) {
      return res.status(400).json({ ok: false, error: 'Provide text or a URL that returns article text.' });
    }

    // 2) lightweight dev parser: make nodes from comma-separated list or from first lines
    const items = articleText.includes(',')
      ? articleText.split(',').map(s => s.trim()).filter(Boolean)
      : articleText.split(/\n/).map(s => s.trim()).filter(Boolean).slice(0, 8);

    const nodes = items.map((it, i) => ({
      id: `u${i}`,
      label: it.length > 40 ? it.slice(0, 40) + '...' : it,
      summary: it,
      keywords: []
    }));

    const edges = nodes.map((_, i) => (i === 0 ? null : { from: `u${i - 1}`, to: `u${i}`, relation: 'related-to' })).filter(Boolean);

    return res.json({ ok: true, graph: { nodes, edges } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
